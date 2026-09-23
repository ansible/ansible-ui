import { yyyyMMddFormat } from '@patternfly/react-core';

/** Matches the automation dashboard "last 7 days" / custom default start offset. */
export const AUTOMATION_DASHBOARD_DEFAULT_RANGE_DAYS = 7;

/** Calendar "today" in the local timezone (matches DatePicker / yyyyMMddFormat). */
export function localTodayDateString(referenceDate: Date = new Date()): string {
  return yyyyMMddFormat(referenceDate);
}

/** Local calendar date N days before referenceDate (handles DST via setDate). */
export function localCalendarDateDaysAgo(days: number, referenceDate: Date = new Date()): string {
  const date = new Date(referenceDate);
  date.setDate(date.getDate() - days);
  return yyyyMMddFormat(date);
}

export function getAutomationDashboardDefaultPeriodDates(referenceDate: Date = new Date()): {
  start: string;
  end: string;
} {
  return {
    start: localCalendarDateDaysAgo(AUTOMATION_DASHBOARD_DEFAULT_RANGE_DAYS, referenceDate),
    end: localTodayDateString(referenceDate),
  };
}
