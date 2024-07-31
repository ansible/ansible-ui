import { useMemo } from 'react';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
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
import { ExceptionsStep } from './ExceptionsStep';
import { SurveyStep } from '../../../common/SurveyStep';
import { ScheduleSelectStep } from './ScheduleSelectStep';
import { NodePromptsStep as SchedulePromptsStep } from '../../../resources/templates/WorkflowVisualizer/wizard/NodePromptsStep';
import { WizardFormValues } from '../../../resources/templates/WorkflowVisualizer/types';
import { shouldHideOtherStep } from '../../../resources/templates/WorkflowVisualizer/wizard/helpers';
import { useProcessSchedule } from '../hooks/useProcessSchedules';
import { useNavigate } from 'react-router-dom';
import { Schedule } from '../../../interfaces/Schedule';
import { RequestError } from '../../../../common/crud/RequestError';
import { RULES_DEFAULT_VALUES } from './constants';
import { ScheduleReviewStep } from './ScheduleReviewStep';
import { useGetScheduleUrl } from '../hooks/useGetScheduleUrl';
import { useSetRRuleItemToRuleSet } from '../hooks/useSetRRuleItemToRuleSet';
import { postRequest } from '../../../../common/crud/Data';
import { awxAPI } from '../../../common/api/awx-utils';

export type StandardizedFormData = Omit<ScheduleFormWizard, 'rules' | 'exceptions'> & {
  rrule: string;
};

/**
 *
 * @param {string}[resourceEndPoint] - This passed down to the ScheduleSelectStep so it can fetch the resource
 * to which the schedule belongs
 * @param {boolean}[isTopLevelSchedule] - This passed down to the ScheduleSelectStep to determine if we need to render
 * the scheduleType field and the resourceSelect field on the form.  If we did not get to the schedule create form from the top level
 * schedules list then we know which resource this schedule will belong to once it is created
 */
export function ScheduleAddWizard(props: {
  resourceEndPoint?: string;
  isTopLevelSchedule?: boolean;
}) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const pageNavigate = usePageNavigate();
  const navigate = useNavigate();
  const processSchedules = useProcessSchedule();
  const getScheduleUrl = useGetScheduleUrl();
  const getRuleSet = useSetRRuleItemToRuleSet();

  const now = DateTime.now();
  const closestQuarterHour: DateTime = DateTime.fromMillis(
    Math.ceil(now.toMillis() / 900000) * 900000
  );

  const [currentDate, time]: string[] = dateToInputDateTime(closestQuarterHour.toISO() as string);
  const handleSubmit = async (formValues: ScheduleFormWizard) => {
    const { rules, exceptions, ...rest } = formValues;
    const ruleset = getRuleSet(rules, exceptions);

    const data: StandardizedFormData = {
      rrule: ruleset.toString().split('\n').join(' '),
      ...rest,
    };
    try {
      const {
        schedule,
      }: {
        schedule: Schedule;
      } = await processSchedules(data);

      const pageUrl = getScheduleUrl('details', schedule) as schedulePageUrl;
      pageNavigate(pageUrl.pageId, { params: pageUrl.params });
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

  const onCancel = () => navigate(location.pathname.replace('create', ''));

  const steps: PageWizardStep[] = useMemo(() => {
    return [
      {
        id: 'details',
        label: t('Details'),
        inputs: <ScheduleSelectStep {...props} />,
      },
      {
        id: 'promptStep',
        label: t('Prompts'),
        inputs: <SchedulePromptsStep />,
        hidden: (wizardData: Partial<ScheduleFormWizard>) => {
          const { resource, schedule_type, launch_config } = wizardData;
          if (
            (schedule_type === 'workflow_job_template' || schedule_type === 'job_template') &&
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

        validate: async (_formData: object, wizardData: Partial<ScheduleFormWizard>) => {
          if (!wizardData?.rules?.length) {
            const errors = {
              __all__: [t('Schedules must have at least one rule.')],
            };

            throw new RequestError('', '', 400, '', errors);
          }

          const ruleset = getRuleSet(wizardData.rules, wizardData.exceptions ?? []);
          const { utc, local } = await postRequest<{ utc: string[]; local: string[] }>(
            awxAPI`/schedules/preview/`,
            {
              rrule: ruleset.toString().split('\n').join(' '),
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
  }, [getRuleSet, t, props]);
  const initialValues = {
    details: {
      name: '',
      description: '',
      schedule_type: '',
      resource: '',
      startDateTime: { date: currentDate, time: time },
      timezone: 'America/New_York',
    },
    rules: { ...RULES_DEFAULT_VALUES, rules: [] },
    exceptions: { ...RULES_DEFAULT_VALUES, exceptions: [] },
  };

  return (
    <PageLayout>
      <PageHeader
        title={t('Create schedule')}
        breadcrumbs={[
          { label: t('Schedules'), to: getPageUrl(AwxRoute.Schedules) },
          { label: t('Create schedule') },
        ]}
      />
      <PageWizard<ScheduleFormWizard>
        steps={steps}
        singleColumn={false}
        onCancel={onCancel}
        defaultValue={initialValues}
        onSubmit={handleSubmit}
        errorAdapter={awxErrorAdapter}
      />
    </PageLayout>
  );
}
