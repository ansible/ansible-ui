import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { RRule, RRuleSet, rrulestr } from 'rrule';
import { PageHeader, PageLayout, PageWizard, usePageNavigate } from '../../../../../framework';
import { useGetPageUrl } from '../../../../../framework/PageNavigation/useGetPageUrl';
import { dateToInputDateTime } from '../../../../../framework/utils/dateTimeHelpers';

import { RequestError } from '../../../../common/crud/RequestError';
import { useGetItem } from '../../../../common/crud/useGet';
import { awxErrorAdapter } from '../../../common/adapters/awxErrorAdapter';
import { awxAPI } from '../../../common/api/awx-utils';

import { Schedule } from '../../../interfaces/Schedule';
import { AwxRoute } from '../../../main/AwxRoutes';

import { useGetScheduleUrl } from '../hooks/useGetScheduleUrl';
import { useProcessSchedule } from '../hooks/useProcessSchedules';

import { ScheduleFormWizard, schedulePageUrl, ScheduleResources } from '../types';
import { RULES_DEFAULT_VALUES } from './constants';
import { useScheduleSteps } from '../hooks/useScheduleSteps';

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
  const params = useParams<{ id?: string; schedule_id?: string }>();

  const { data: schedule } = useGetItem<Schedule>(awxAPI`/schedules/`, params.schedule_id);

  const [startDate, time]: string[] = dateToInputDateTime(
    schedule?.dtstart as string,
    schedule?.timezone
  );

  const handleSubmit = async (formValues: ScheduleFormWizard) => {
    try {
      const {
        schedule,
      }: {
        schedule: Schedule;
      } = await processSchedules(formValues);
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
  const steps = useScheduleSteps();

  if (!schedule) return;
  const ruleSet = rrulestr(schedule.rrule, { forceset: true }) as RRuleSet;
  const rules = ruleSet
    .rrules()
    .map((rule, i) => ({ rule: RRule.optionsToString({ ...rule.origOptions }), id: i + 1 }));
  const exceptions = ruleSet
    .exrules()
    .map((rule, i) => ({ rule: RRule.optionsToString({ ...rule.origOptions }), id: i + 1 }));

  const currentValues = {
    details: {
      name: schedule?.name,
      description: schedule?.description,
      schedule_type: schedule?.summary_fields.unified_job_template.unified_job_type,
      resource: undefined,
      startDateTime: { date: startDate, time: time },
      timezone: schedule?.timezone,
      schedule_days_to_keep: schedule.extra_data.days,
    } as Partial<ScheduleResources> as ScheduleResources,
    promptStep: {},
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
        steps={steps(props.resourceEndPoint)}
        singleColumn={false}
        onCancel={onCancel}
        stepDefaults={currentValues}
        onSubmit={handleSubmit}
        errorAdapter={awxErrorAdapter}
      />
    </PageLayout>
  );
}
