import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader, PageLayout, PageWizard, PageWizardStep } from '../../../../../framework';
import { useGetPageUrl } from '../../../../../framework/PageNavigation/useGetPageUrl';
import { dateToInputDateTime } from '../../../../../framework/utils/dateTimeHelpers';
import { AwxRoute } from '../../../main/AwxRoutes';
import { ScheduleFormWizard } from '../types';
import { awxErrorAdapter } from '../../../common/adapters/awxErrorAdapter';
import { RulesStep } from './RulesStep';
import { Frequency, RRule, rrulestr } from 'rrule';
import { ExceptionsStep } from './ExceptionsStep';
import { ScheduleSurveyStep } from './ScheduleSurveyStep';
import { NodeTypeStep } from '../../../resources/templates/WorkflowVisualizer/wizard/NodeTypeStep';
import { NodePromptsStep } from '../../../resources/templates/WorkflowVisualizer/wizard/NodePromptsStep';
import { WizardFormValues } from '../../../resources/templates/WorkflowVisualizer/types';
import { shouldHideOtherStep } from '../../../resources/templates/WorkflowVisualizer/wizard/helpers';
import { RESOURCE_TYPE } from '../../../resources/templates/WorkflowVisualizer/constants';
import { useGetItem } from '../../../../common/crud/useGet';
import { Schedule } from '../../../interfaces/Schedule';
import { awxAPI } from '../../../common/api/awx-utils';
import { NodeReviewStep } from '../../../resources/templates/WorkflowVisualizer/wizard/NodeReviewStep';
export function ScheduleEditWizard() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const params = useParams<{ id?: string; schedule_id?: string }>();

  const { data: schedule } = useGetItem<Schedule>(awxAPI`/schedules/`, params.schedule_id);

  const navigate = useNavigate();

  const [startDate, time]: string[] = dateToInputDateTime(
    schedule?.dtstart as string,
    schedule?.timezone
  );

  const handleSubmit = async (formValues: ScheduleFormWizard) => {
    const { unified_job_template_object = {}, launch_config, prompt } = formValues;
    const promptValues = prompt;
    if (promptValues) {
      if (unified_job_template_object && 'organization' in unified_job_template_object) {
        promptValues.organization = unified_job_template_object.organization ?? null;
      }
      if (launch_config) {
        promptValues.original = {
          launch_config,
        };
      }
    }

    await Promise.resolve();
  };

  const onCancel = () => navigate(-1);

  const steps: PageWizardStep[] = [
    {
      id: 'details',
      label: t('Details'),
      inputs: <NodeTypeStep />,
    },
    {
      id: 'nodePromptsStep',
      label: t('Prompts'),
      inputs: <NodePromptsStep />,
      hidden: (wizardData: Partial<WizardFormValues>) => {
        const { launch_config, node_resource, node_type } = wizardData;
        if (
          (node_type === RESOURCE_TYPE.workflow_job || node_type === RESOURCE_TYPE.job) &&
          node_resource &&
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
      inputs: <ScheduleSurveyStep />,
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
  const ruleObj = schedule.rrule && rrulestr(schedule.rrule);

  const currentValues = {
    details: {
      name: schedule?.name,
      description: schedule?.description,
      resource_type: schedule?.summary_fields.unified_job_template.job_type,
      resourceName: schedule?.summary_fields.unified_job_template.name,
      startDateTime: { date: startDate, time: time },
      timezone: schedule?.timezone,
    },
    nodePromptsStep: {
      prompt: {},
    },
    rules: {
      id: undefined,
      freq: Frequency.WEEKLY,
      interval: 1,
      wkst: RRule.SU,
      byweekday: null,
      byweekno: null,
      bymonth: null,
      bymonthday: null,
      byyearday: null,
      bysetpos: null,
      until: null,
      count: null,
      byminute: null,
      byhour: null,
      endingType: '',
      rules: [{ id: 1, rule: ruleObj }],
    },
    exceptions: {
      id: undefined,
      freq: null,
      interval: null,
      wkst: null,
      byweekday: null,
      byweekno: null,
      bymonth: null,
      bymonthday: null,
      byyearday: null,
      bysetpos: null,
      until: null,
      count: null,
      byminute: null,
      byhour: null,
      endingType: '',
      exceptions: [],
    },
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
