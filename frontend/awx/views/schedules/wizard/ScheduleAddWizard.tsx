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
import { useGetTimezones } from '../hooks/useGetTimezones';
import { PromptInputs } from '../components/PromptInputs';
import { OccurrencesStep } from './OccurrencesStep';
import { Frequency, RRule } from 'rrule';
import { ScheduleInputs } from '../components/ScheduleInputs';

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
    const {
      details: { unified_job_template_object },
      launch_config,
      prompt,
    } = formValues;
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

  const { timeZones, links } = useGetTimezones();

  const steps: PageWizardStep[] = [
    {
      id: 'details',
      label: t('Details'),
      inputs: <ScheduleInputs onError={() => {}} zoneLinks={links} timeZones={timeZones} />,
    },
    {
      id: 'promptsStep',
      label: t('Prompts'),
      inputs: <PromptInputs onError={() => {}} />,
    },
    { id: 'survey', label: t('Survey'), element: <PageNotImplemented /> },
    { id: 'occurrence', label: t('Occurrences'), inputs: <OccurrencesStep /> },
    {
      id: 'exceptions',
      label: t('Exceptions'),
      hidden: () => true,
      element: <PageNotImplemented />,
    },
    { id: 'review', label: t('Review'), hidden: () => true, inputs: <PageNotImplemented /> },
  ];
  const initialValues = {
    details: {
      name: '',
      description: '',
      resource_type: '',
      resourceName: '',
      startDateTime: { date: currentDate, time: time },
    },
    occurrence: {
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
      endDate: '',
      endTime: '',
      count: null,
      byminute: null,
      byhour: null,
      endingType: '',
      rules: [],
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
