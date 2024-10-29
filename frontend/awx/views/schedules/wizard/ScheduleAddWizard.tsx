import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageHeader, PageLayout, PageWizard, usePageNavigate } from '../../../../../framework';
import { useGetPageUrl } from '../../../../../framework/PageNavigation/useGetPageUrl';
import { dateToInputDateTime } from '../../../../../framework/utils/dateTimeHelpers';
import { RequestError } from '../../../../common/crud/RequestError';
import { awxErrorAdapter } from '../../../common/adapters/awxErrorAdapter';
import { Schedule } from '../../../interfaces/Schedule';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useGetScheduleUrl } from '../hooks/useGetScheduleUrl';
import { useProcessSchedule } from '../hooks/useProcessSchedules';
import { ScheduleFormWizard, schedulePageUrl } from '../types';
import { RULES_DEFAULT_VALUES } from './constants';
import { useScheduleSteps } from '../hooks/useScheduleSteps';

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
  const steps = useScheduleSteps();
  const now = DateTime.now();
  const closestQuarterHour: DateTime = DateTime.fromMillis(
    Math.ceil(now.toMillis() / 900000) * 900000
  );

  const [currentDate, time]: string[] = dateToInputDateTime(closestQuarterHour.toISO() as string);
  const handleSubmit = async (formValues: ScheduleFormWizard) => {
    try {
      const {
        schedule,
      }: {
        schedule: Schedule;
      } = await processSchedules(formValues);

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

  const initialValues: { [stepId: string]: Partial<ScheduleFormWizard> } = {
    details: {
      name: '',
      description: '',
      schedule_type: '',
      startDateTime: { date: currentDate, time: time },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    promptStep: {
      // This needs to be set from the "details" step when the resource is selected
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
        steps={steps(props.resourceEndPoint, props.isTopLevelSchedule)}
        singleColumn={false}
        onCancel={onCancel}
        stepDefaults={initialValues}
        onSubmit={handleSubmit}
        errorAdapter={awxErrorAdapter}
      />
    </PageLayout>
  );
}
