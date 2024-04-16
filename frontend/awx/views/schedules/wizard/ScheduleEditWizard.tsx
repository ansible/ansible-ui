import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { PageHeader, PageLayout, PageWizard, PageWizardStep } from '../../../../../framework';
import { useGetPageUrl } from '../../../../../framework/PageNavigation/useGetPageUrl';
import { dateToInputDateTime } from '../../../../../framework/utils/dateTimeHelpers';
import { AwxRoute } from '../../../main/AwxRoutes';
import { ScheduleFormWizard } from '../types';
import { awxErrorAdapter } from '../../../common/adapters/awxErrorAdapter';
import { RulesStep } from './RulesStep';
import { RRuleSet, rrulestr } from 'rrule';
import { ExceptionsStep } from './ExceptionsStep';
import { SurveyStep } from '../../../common/SurveyStep';
import { NodePromptsStep } from '../../../resources/templates/WorkflowVisualizer/wizard/NodePromptsStep';
import { WizardFormValues } from '../../../resources/templates/WorkflowVisualizer/types';
import { shouldHideOtherStep } from '../../../resources/templates/WorkflowVisualizer/wizard/helpers';
import { RESOURCE_TYPE } from '../../../resources/templates/WorkflowVisualizer/constants';
import { useGetItem } from '../../../../common/crud/useGet';
import { Schedule } from '../../../interfaces/Schedule';
import { awxAPI } from '../../../common/api/awx-utils';
import { NodeReviewStep } from '../../../resources/templates/WorkflowVisualizer/wizard/NodeReviewStep';
import { RULES_DEFAULT_VALUES } from './constants';
import { ScheduleSelectStep } from './ScheduleSelectStep';
export function ScheduleEditWizard() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const params = useParams<{ id?: string; schedule_id?: string }>();

  const { data: schedule } = useGetItem<Schedule>(awxAPI`/schedules/`, params.schedule_id);

  const navigate = useNavigate();
  const location = useLocation();

  const [startDate, time]: string[] = dateToInputDateTime(
    schedule?.dtstart as string,
    schedule?.timezone
  );

  const handleSubmit = async (formValues: ScheduleFormWizard) => {
    const { launch_config, prompt } = formValues;
    const promptValues = prompt;
    if (promptValues) {
      if (launch_config) {
        promptValues.original = {
          launch_config,
        };
      }
    }

    await Promise.resolve();
  };

  const onCancel = () => navigate(location.pathname.replace('edit', 'details'));

  const steps: PageWizardStep[] = [
    {
      id: 'details',
      label: t('Details'),
      inputs: <ScheduleSelectStep />,
    },
    {
      id: 'nodePromptsStep',
      label: t('Prompts'),
      inputs: <NodePromptsStep />,
      hidden: (wizardData: Partial<ScheduleFormWizard>) => {
        const { launch_config, resource, schedule_type } = wizardData;
        if (
          (schedule_type === RESOURCE_TYPE.workflow_job || schedule_type === RESOURCE_TYPE.job) &&
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
    { id: 'rules', label: t('Rules'), inputs: <RulesStep /> },
    {
      id: 'exceptions',
      label: t('Exceptions'),
      inputs: <ExceptionsStep />,
    },
    { id: 'review', label: t('Review'), inputs: <NodeReviewStep /> },
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
    },
    nodePromptsStep: {
      prompt: {},
    },
    rules: { ...RULES_DEFAULT_VALUES, rules },
    exceptions: { ...RULES_DEFAULT_VALUES, exceptions },
  };

  return (
    <PageLayout>
      <PageHeader
        title={t('Edit Schedule')}
        breadcrumbs={[
          { label: t('Schedules'), to: getPageUrl(AwxRoute.Schedules) },
          { label: t('Edit Schedule') },
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
