import { IFilterState } from '@ansible/ansible-ui-framework';
import { DateTime } from 'luxon';

const RELATIVE_PERIOD_DAYS: Record<string, number> = {
  last_7_days: 7,
  last_14_days: 14,
  last_30_days: 30,
  last_60_days: 60,
  last_90_days: 90,
};

const CONTROLLER_FILTERS: Record<string, string> = {
  label: 'labels__id',
  organization: 'organization',
  template: 'job_template',
  project: 'project',
};

function appendFilterValues(params: URLSearchParams, filterState: IFilterState | undefined) {
  for (const [dashboardKey, controllerKey] of Object.entries(CONTROLLER_FILTERS)) {
    for (const value of filterState?.[dashboardKey] ?? []) {
      if (value) params.append(controllerKey, value);
    }
  }
}

function appendDateBounds(
  params: URLSearchParams,
  period: string[] | undefined,
  timeZone: string,
  now: DateTime
) {
  if (!period?.length) return;

  const zoneNow = now.setZone(timeZone);
  if (!zoneNow.isValid) return;

  let start: DateTime;
  let end: DateTime;
  const relativeDays = RELATIVE_PERIOD_DAYS[period[0]];

  if (relativeDays) {
    // The metrics service uses a timedelta from the current instant, rather than
    // calendar-day arithmetic. Keep the Controller window aligned across DST.
    start = zoneNow.minus({ hours: relativeDays * 24 });
    end = zoneNow;
  } else if (period[0] === 'custom' && period[1] && period[2]) {
    start = DateTime.fromISO(period[1], { zone: timeZone }).startOf('day');
    end = DateTime.fromISO(period[2], { zone: timeZone }).endOf('day');
  } else {
    return;
  }

  if (!start.isValid || !end.isValid || start.toMillis() > end.toMillis()) return;

  const startIso = start.toUTC().toISO();
  const endIso = end.toUTC().toISO();
  if (startIso && endIso) {
    params.set('finished__gte', startIso);
    params.set('finished__lte', endIso);
  }
}

export function getControllerJobsUrl(
  status: 'successful' | 'failed',
  filterState: IFilterState | undefined,
  timeZone: string,
  now: DateTime = DateTime.now()
): string {
  const params = new URLSearchParams({ status });
  appendFilterValues(params, filterState);
  appendDateBounds(params, filterState?.period, timeZone, now);
  return `?${params.toString()}`;
}
