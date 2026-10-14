import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  alignJobChartSeriesByDay,
  formatDashboardJobChartDateLabel,
  mapJobChartTuples,
} from './jobsChartUtils';

describe('jobsChartUtils', () => {
  const originalTz = process.env.TZ;

  beforeAll(() => {
    process.env.TZ = 'America/New_York';
  });

  afterAll(() => {
    if (originalTz === undefined) {
      delete process.env.TZ;
    } else {
      process.env.TZ = originalTz;
    }
  });

  it('should label dashboard graph buckets using UTC calendar dates', () => {
    const octoberFirstUtc = Math.floor(Date.UTC(2025, 9, 1) / 1000);
    expect(formatDashboardJobChartDateLabel(octoberFirstUtc, 'month')).toBe('10/1');
  });

  it('should format day period buckets as a locale time string', () => {
    const noonUtc = Math.floor(Date.UTC(2025, 9, 1, 12, 0, 0) / 1000);
    expect(formatDashboardJobChartDateLabel(noonUtc, 'day')).toBe(
      new Date(noonUtc * 1000).toLocaleTimeString()
    );
  });

  it('should align all status series to include the current-day category', () => {
    const previousDay = Math.floor(Date.UTC(2025, 8, 30) / 1000);
    const currentDay = Math.floor(Date.UTC(2025, 9, 1) / 1000);

    const [successful, failed] = alignJobChartSeriesByDay([
      mapJobChartTuples(
        [
          [previousDay, 2],
          [currentDay, 11],
        ],
        'month'
      ),
      mapJobChartTuples([[currentDay, 1]], 'month'),
    ]);

    expect(successful.map((point) => point.label)).toEqual(['9/30', '10/1']);
    expect(failed).toEqual([
      { label: '9/30', value: 0 },
      { label: '10/1', value: 1 },
    ]);
  });
});
