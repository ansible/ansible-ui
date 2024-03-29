import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
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
import { PromptInputs } from '../components/PromptInputs';
import { ScheduleSurveyStep } from './ScheduleSurveyStep';
import { LaunchConfiguration } from '../../../interfaces/LaunchConfiguration';
import { NodeTypeStep } from '../../../resources/templates/WorkflowVisualizer/wizard/NodeTypeStep';

export function ScheduleAddWizard() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const now = DateTime.now();

  const closestQuarterHour: DateTime = DateTime.fromMillis(
    Math.ceil(now.toMillis() / 900000) * 900000
  );
  const navigate = useNavigate();

  const [currentDate, time]: string[] = dateToInputDateTime(closestQuarterHour.toISO() as string);
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
      id: 'promptsStep',
      label: t('Prompts'),
      inputs: <PromptInputs onError={() => {}} />,
    },
    {
      id: 'survey',
      label: t('Survey'),
      inputs: <ScheduleSurveyStep />,
      hidden: (wizardData: Partial<LaunchConfiguration>) => {
        if (Object.keys(wizardData).length === 0) {
          return true;
        }
        if (wizardData.unified_job_template_object?.survey_enabled) {
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
  const initialValues = {
    details: {
      name: '',
      description: '',
      resource_type: '',
      resourceName: '',
      startDateTime: { date: currentDate, time: time },
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
      rules: [],
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
        defaultValue={initialValues}
        onSubmit={handleSubmit}
        errorAdapter={awxErrorAdapter}
      />
    </PageLayout>
  );
}
