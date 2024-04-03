import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  PageHeader,
  PageLayout,
  PageNotImplemented,
  PageWizard,
  PageWizardStep,
} from '../../../../../framework';
import { useGetPageUrl } from '../../../../../framework/PageNavigation/useGetPageUrl';
import { dateToInputDateTime } from '../../../../../framework/utils/dateTimeHelpers';
import { AwxRoute } from '../../../main/AwxRoutes';
import { ScheduleFormWizard } from '../types';
import { awxErrorAdapter } from '../../../common/adapters/awxErrorAdapter';
import { RulesStep } from './RulesStep';
import { Frequency, RRule } from 'rrule';
import { ExceptionsStep } from './ExceptionsStep';
import { ScheduleSurveyStep } from './ScheduleSurveyStep';
import { NodeTypeStep } from '../../../resources/templates/WorkflowVisualizer/wizard/NodeTypeStep';
import { NodePromptsStep } from '../../../resources/templates/WorkflowVisualizer/wizard/NodePromptsStep';
import { WizardFormValues } from '../../../resources/templates/WorkflowVisualizer/types';
import { shouldHideOtherStep } from '../../../resources/templates/WorkflowVisualizer/wizard/helpers';
import { RESOURCE_TYPE } from '../../../resources/templates/WorkflowVisualizer/constants';
import { useGet, useGetItem } from '../../../../common/crud/useGet';
import { Schedule } from '../../../interfaces/Schedule';
import { awxAPI } from '../../../common/api/awx-utils';
import { parseStringToTagArray } from '../../../resources/templates/JobTemplateFormHelpers';
import { InstanceGroup } from '../../../interfaces/InstanceGroup';
import { Label } from '../../../interfaces/Label';
import { Organization } from '../../../interfaces/Organization';

export function ScheduleEditWizard() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const params = useParams<{ id?: string; schedule_id?: string }>();

  const { data: schedule } = useGetItem<Schedule>(awxAPI`/schedules/`, params.schedule_id);
  const { data: instance_groups } = useGet<InstanceGroup>(
    awxAPI`/schedules/${params.schedule_id as string}/instance_groups/`
  );
  const { data: labels } = useGet<Label>(
    awxAPI`/schedules/${params.schedule_id as string}/labels/`
  );
  const { data: credentials } = useGet<Credential>(
    awxAPI`/schedules/${params.schedule_id as string}/credentials/`
  );
  console.log(schedule)
  console.log(instance_groups)
  console.log(labels)
  console.log(credentials)

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
    { id: 'review', label: t('Review'), inputs: <PageNotImplemented /> },
  ];
  const currentValues = {
    details: {
      name: schedule?.name,
      description: schedule?.description,
      resource_type: schedule?.summary_fields.unified_job_template.job_type,
      resourceName: schedule?.summary_fields.unified_job_template.name,
      startDateTime: { date: startDate, time: time },
      timezone: schedule?.timezone,
    },
    prompt: {
      credentials: credentials,
      diff_mode: schedule?.diff_mode,
      execution_environment: schedule?.execution_environment,
      extra_vars: schedule?.extra_data,
      forks: schedule?.forks,
      instance_groups: instance_groups,
      inventory: schedule?.inventory,
      job_slice_count: schedule?.job_slice_count,
      job_tags: schedule?.job_tags && parseStringToTagArray(schedule?.job_tags),
      job_type: schedule?.job_type,
      labels: labels,
      limit: schedule?.limit,
      scm_branch: schedule?.scm_branch,
      skip_tags: schedule?.skip_tags && parseStringToTagArray(schedule?.skip_tags),
      timeout: schedule?.timeout,
      verbosity: schedule?.verbosity,
    },
    rules: schedule?.rrule,
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
        title={t('Create Schedule')}
        breadcrumbs={[
          { label: t('Schedules'), to: getPageUrl(AwxRoute.Schedules) },
          { label: t('Create Schedule') },
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
