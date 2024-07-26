import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  PageHeader,
  PageLayout,
  PageWizard,
  PageWizardStep,
  usePageNavigate,
} from '../../../../../framework';
import { useGetPageUrl } from '../../../../../framework/PageNavigation/useGetPageUrl';
import { dateToInputDateTime } from '../../../../../framework/utils/dateTimeHelpers';
import { AwxRoute } from '../../../main/AwxRoutes';
import { RuleFields, ScheduleFormWizard, schedulePageUrl } from '../types';
import { awxErrorAdapter } from '../../../common/adapters/awxErrorAdapter';
import { RulesStep } from './RulesStep';
import { RRuleSet, rrulestr } from 'rrule';
import { ExceptionsStep } from './ExceptionsStep';
import { SurveyStep } from '../../../common/SurveyStep';
import { NodePromptsStep as PromptsStep } from '../../../resources/templates/WorkflowVisualizer/wizard/NodePromptsStep';
import { WizardFormValues } from '../../../resources/templates/WorkflowVisualizer/types';
import { shouldHideOtherStep } from '../../../resources/templates/WorkflowVisualizer/wizard/helpers';
import { useGetItem } from '../../../../common/crud/useGet';
import { Schedule } from '../../../interfaces/Schedule';
import { awxAPI } from '../../../common/api/awx-utils';
import { RULES_DEFAULT_VALUES } from './constants';
import { ScheduleSelectStep } from './ScheduleSelectStep';
import { ScheduleReviewStep } from './ScheduleReviewStep';
import { StandardizedFormData } from './ScheduleAddWizard';
import { useProcessSchedule } from '../hooks/useProcessSchedules';
import { useGetScheduleUrl } from '../hooks/useGetScheduleUrl';
import { RequestError } from '../../../../common/crud/RequestError';
import { postRequest } from '../../../../common/crud/Data';
import { useSetRRuleItemToRuleSet } from '../hooks/useSetRRuleItemToRuleSet';

/**
 *
 * @param {string} resourceEndPoint - This is passed down to the <ScheduleSelectStep/> so it can fetch the resource
 * to which the schedule belongs
 */
export function ScheduleEditWizard(props: { resourceEndPoint: string }) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();
  const processSchedules = useProcessSchedule();
  const getScheduleUrl = useGetScheduleUrl();
  const getRuleSet = useSetRRuleItemToRuleSet();
  const params = useParams<{ id?: string; schedule_id?: string }>();

  const { data: schedule } = useGetItem<Schedule>(awxAPI`/schedules/`, params.schedule_id);

  const [startDate, time]: string[] = dateToInputDateTime(
    schedule?.dtstart as string,
    schedule?.timezone
  );

  const handleSubmit = async (formValues: ScheduleFormWizard) => {
    const { rules, exceptions, ...rest } = formValues;
    const ruleset = getRuleSet(rules, exceptions);

    const data: StandardizedFormData = {
      rrule: ruleset.toString(),
      ...rest,
    };

    try {
      const {
        schedule,
      }: {
        schedule: Schedule;
      } = await processSchedules(data);
      const pageUrl = getScheduleUrl('details', schedule) as schedulePageUrl;
      return pageNavigate(pageUrl.pageId, { params: pageUrl.params });
    } catch (error) {
      const { fieldErrors } = awxErrorAdapter(error);
      const missingResource = fieldErrors.find((err) => err?.name === 'resources_needed_to_start');
      if (missingResource) {
        const errors = {
          __all__: [missingResource.message],
        };
        throw new RequestError('', '', 400, '', errors);
      }
    }
  };

  const onCancel = () => navigate(-1);

  const steps: PageWizardStep[] = [
    {
      id: 'details',
      label: t('Details'),
      inputs: <ScheduleSelectStep {...props} />,
    },
    {
      id: 'promptStep',
      label: t('Prompts'),
      inputs: <PromptsStep />,
      hidden: (wizardData: Partial<ScheduleFormWizard>) => {
        const { launch_config, resource, schedule_type } = wizardData;
        if (
          (schedule_type === 'workflow_job' || schedule_type === 'job') &&
          resource &&
          launch_config
        ) {
          return shouldHideOtherStep(launch_config);
        }
        return true;
      },
    },
    {
      id: 'survey',
      label: t('Survey'),
      inputs: <SurveyStep />,
      hidden: (wizardData: Partial<WizardFormValues>) => {
        if (Object.keys(wizardData).length === 0) {
          return true;
        }
        if (wizardData.launch_config?.survey_enabled) {
          return false;
        }
        return true;
      },
    },
    {
      id: 'rules',
      label: t('Rules'),
      inputs: <RulesStep />,
      validate: (formData: Partial<RuleFields>) => {
        if (!formData?.rules?.length) {
          const errors = {
            __all__: [t('Schedules must have at least one rule.')],
          };

          throw new RequestError('', '', 400, '', errors);
        }
      },
    },
    {
      id: 'exceptions',
      label: t('Exceptions'),
      inputs: <ExceptionsStep />,
    },
    {
      id: 'review',
      label: t('Review'),
      inputs: <ScheduleReviewStep />,
      validate: async (formData: object, wizardData: Partial<ScheduleFormWizard>) => {
        if (!wizardData?.rules?.length) {
          const errors = {
            __all__: [t('Schedules must have at least one rule.')],
          };

          throw new RequestError('', '', 400, '', errors);
        }
        console.log(formData);
        const ruleset = getRuleSet(wizardData.rules, wizardData.exceptions ?? []);
        console.log(ruleset);
        const { utc, local } = await postRequest<{ utc: string[]; local: string[] }>(
          awxAPI`/schedules/preview/`,
          {
            rrule: ruleset.toString(),
          }
        );
        if (!local.length && !utc.length) {
          const errors = {
            __all__: [
              t(
                'This schedule will never run.  If you have defined exceptions it is likely that the exceptions cancel out all the rules defined in the rules step.'
              ),
            ],
          };

          throw new RequestError('', '', 400, '', errors);
        }
      },
    },
  ];

  if (!schedule) return;
  const ruleSet = rrulestr(schedule.rrule, { forceset: true }) as RRuleSet;
  const rules = ruleSet.rrules().map((rule, i) => ({ rule, id: i + 1 }));
  const exceptions = ruleSet.exrules().map((rule, i) => ({ rule, id: i + 1 }));

  const currentValues = {
    details: {
      name: schedule?.name,
      description: schedule?.description,
      schedule_type: schedule?.summary_fields.unified_job_template.unified_job_type,
      resource: schedule?.summary_fields.unified_job_template,
      startDateTime: { date: startDate, time: time },
      timezone: schedule?.timezone,
      schedule_days_to_keep: schedule.extra_data.days,
    },
    promptStep: {
      prompt: {},
    },
    rules: { ...RULES_DEFAULT_VALUES, rules },
    exceptions: { ...RULES_DEFAULT_VALUES, exceptions },
  };

  return (
    <PageLayout>
      <PageHeader
        title={
          schedule?.name
            ? t('Edit {{scheduleName}}', { scheduleName: schedule?.name })
            : t('Schedule')
        }
        breadcrumbs={[
          { label: t('Schedules'), to: getPageUrl(AwxRoute.Schedules) },
          {
            label: schedule?.name
              ? t('Edit {{scheduleName}}', { scheduleName: schedule?.name })
              : t('Schedule'),
          },
        ]}
      />
      <PageWizard<ScheduleFormWizard>
        steps={steps}
        singleColumn={false}
        onCancel={onCancel}
        defaultValue={currentValues}
        onSubmit={handleSubmit}
        errorAdapter={awxErrorAdapter}
      />
    </PageLayout>
  );
}
