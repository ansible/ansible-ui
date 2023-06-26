import { RRule, RRuleSet } from 'rrule';
import { useTranslation } from 'react-i18next';
import { PageForm, PageHeader, PageLayout, PageFormSubmitHandler } from '../../../../framework';
import { RouteObj } from '../../../Routes';
import { DateTime } from 'luxon';
import { dateToInputDateTime } from '../../../../framework/utils/dateTimeHelpers';
import { ScheduleInputs } from './components/ScheduleInputs';
import { useGet } from '../../../common/crud/useGet';
import { useMemo, useState, useEffect } from 'react';
import { LoadingPage } from '../../../../framework/components/LoadingPage';
import { getAwxError } from '../../useAwxView';
import { useNavigate, useParams } from 'react-router-dom';
import { postRequest, requestGet } from '../../../common/crud/Data';
import { ScheduleFormFields } from '../../interfaces/ScheduleFormFields';
import { JobTemplate } from '../../interfaces/JobTemplate';
import { WorkflowJobTemplate } from '../../interfaces/WorkflowJobTemplate';
import { Project } from '../../interfaces/Project';
import { InventorySource } from '../../interfaces/InventorySource';

const urls: { [key: string]: string } = {
  inventory: '/api/v2/inventories/',
  projects: '/api/v2/projects/',
  job_template: '/api/v2/job_templates/',
  workflow_job_template: '/api/v2/workflow_job_templates/',
};

const routes: { [key: string]: string } = {
  inventory: RouteObj.InventorySourceScheduleDetails,
  job_template: RouteObj.JobTemplateScheduleDetails,
  workflow_job_template: RouteObj.WorkflowJobTemplateScheduleDetails,
  project: RouteObj.ProjectScheduleDetails,
};

export function CreateSchedule() {
  const { t } = useTranslation();
  const now = DateTime.now();
  const [resourceForSchedule, setResourceForSchedule] = useState<
    JobTemplate | WorkflowJobTemplate | Project | InventorySource
  >();
  const params: { [string: string]: string } = useParams<{ id: string; source_id?: string }>();
  const closestQuarterHour: DateTime = DateTime.fromMillis(
    Math.ceil(now.toMillis() / 900000) * 900000
  );

  const navigate = useNavigate();

  const [currentDate, time]: string[] = dateToInputDateTime(closestQuarterHour.toISO() as string);

  useEffect(() => {
    const resource = async () => {
      if (!params.id) return;
      try {
        const response = await requestGet<
          Project | JobTemplate | WorkflowJobTemplate | InventorySource
        >(`${urls[params['*'].split('/')[0]]}${params.id}/`);
        setResourceForSchedule(response);
      } catch {
        // handle error
      }
    };
    void resource();
  }, [params]);

  const onSubmit: PageFormSubmitHandler<ScheduleFormFields> = async (values, setError) => {
    const { name, unified_job_template, resource_type, inventory } = values;
    const ruleSet = buildScheduleContainer(values);
    const requestData = {
      name,
      unified_job_template,
      rrule: ruleSet.toString().replace(/\n/g, ' '),
    };
    try {
      if (resource_type === 'inventory' && inventory) {
        const response = await postRequest<ScheduleFormFields>(
          `/api/v2/inventories/${inventory.id}/${unified_job_template?.id?.toString()}/schedules/`,
          requestData
        );
        navigate(
          RouteObj.InventorySourceScheduleDetails.replace(':id', inventory.toString())
            .replace(':source_id', unified_job_template?.id?.toString())
            .replace(':schedule_id', response?.id?.toString())
        );
      } else {
        const response = await postRequest<ScheduleFormFields>(
          `${urls[resource_type]}${unified_job_template?.id?.toString()}/schedules/`,
          requestData
        );
        navigate(
          routes[resource_type]
            .replace(':id', unified_job_template?.id?.toString())
            .replace(':schedule_id', response.id.toString())
        );
      }
    } catch (err) {
      setError(await getAwxError(err));
    }
  };
  const onCancel = () => navigate(-1);
  const { data, isLoading } = useGet<{ zones: string[]; links: Record<string, string> }>(
    '/api/v2/schedules/zoneinfo/'
  );
  const timeZones = useMemo(
    () =>
      (data?.zones || []).map((zone) => ({
        value: zone,
        key: zone,
        label: zone,
      })),
    [data?.zones]
  );

  if (isLoading) {
    <LoadingPage />;
  }
  return (
    <PageLayout>
      <PageHeader
        title={t('Create Schedule')}
        breadcrumbs={[
          { label: t('Schedules'), to: RouteObj.Schedules },
          { label: t('Create Schedule') },
        ]}
      />
      <PageForm<ScheduleFormFields>
        defaultValue={{
          resource_type: resourceForSchedule?.type || '',
          unified_job_template: resourceForSchedule,
          inventory: null,
          resourceName: '',
          name: '',
          description: '',
          frequencies: [],
          freq: 3,
          interval: 1,
          wkst: 'SU',
          byweekday: [], //iCalendar RFC's equivalent to the byday keyword
          byweekno: [],
          bymonth: [],
          endDate: DateTime.now().toFormat('yyyy-LL-dd'),
          endTime: time,
          count: 1,
          endingType: 'never',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          startDateTime: { startDate: currentDate, startTime: time },
        }}
        submitText={t('Submit schedule')}
        onSubmit={onSubmit}
        onCancel={onCancel}
      >
        <ScheduleInputs
          timeZones={timeZones}
          resourceForSchedule={resourceForSchedule}
          zoneLinks={data?.links}
        />
      </PageForm>
    </PageLayout>
  );
}

function buildScheduleContainer(values: ScheduleFormFields) {
  const set = new RRuleSet();

  // if (!useUTCStart) {
  const startRule = buildDtStartObj({
    startDate: values.startDateTime.startDate,
    startTime: values.startDateTime.startTime,
    timezone: values.timezone,
  });
  startRule.origOptions.tzid = values.timezone;
  startRule.origOptions.freq = values.freq;
  startRule.origOptions.interval = values.interval;
  set.rrule(startRule);
  // }

  return set;
}

const parseTime = (time: string) => [
  DateTime.fromFormat(time, 'h:mm a').hour,
  DateTime.fromFormat(time, 'h:mm a').minute,
];

export function buildDtStartObj(values: {
  startDate: string;
  startTime: string;
  timezone: string;
}) {
  // Dates are formatted like "YYYY-MM-DD"
  const [startYear, startMonth, startDay] = values.startDate.split('-');
  // Times are formatted like "HH:MM:SS" or "HH:MM" if no seconds
  // have been specified
  const [startHour, startMinute] = parseTime(values.startTime);

  const dateString = `${startYear}${pad(startMonth)}${pad(startDay)}T${pad(startHour)}${pad(
    startMinute
  )}00`;
  const rruleString = values.timezone
    ? `DTSTART;TZID=${values.timezone}:${dateString}`
    : `DTSTART:${dateString}Z`;
  const rule = RRule.fromString(rruleString);

  return rule;
}

function pad(num: string | number) {
  if (typeof num === 'string') {
    return num;
  }
  return num < 10 ? `0${num}` : num;
}
