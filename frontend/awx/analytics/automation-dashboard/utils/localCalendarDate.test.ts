/* eslint-disable i18next/no-literal-string */
import { afterEach, describe, expect, test, vi } from 'vitest';
import {
  AUTOMATION_DASHBOARD_DEFAULT_RANGE_DAYS,
  getAutomationDashboardDefaultPeriodDates,
  localCalendarDateDaysAgo,
  localTodayDateString,
} from './localCalendarDate';

describe('localCalendarDate', () => {
  const originalTz = process.env.TZ;

  afterEach(() => {
    vi.useRealTimers();
    process.env.TZ = originalTz;
  });

  test('should compute today and 7-days-ago on the same local calendar', () => {
    process.env.TZ = 'America/Los_Angeles';
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));

    const { start, end } = getAutomationDashboardDefaultPeriodDates();
    expect(end).toBe(localTodayDateString());
    expect(start).toBe(localCalendarDateDaysAgo(AUTOMATION_DASHBOARD_DEFAULT_RANGE_DAYS));
    expect(start).toBe('2024-06-08');
    expect(end).toBe('2024-06-15');
  });
});
