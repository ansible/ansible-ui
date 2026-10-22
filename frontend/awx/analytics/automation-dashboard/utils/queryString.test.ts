import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import {
  IFilterState,
  IToolbarDateRangeFilter,
  IToolbarFilter,
  IToolbarSingleSelectFilter,
  ToolbarFilterType,
} from '@ansible/ansible-ui-framework';
import {
  getPeriodFilterParam,
  hasValidRequiredFilters,
  isRequiredFilterValid,
} from './queryString';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const singleSelectFilter: IToolbarSingleSelectFilter = {
  type: ToolbarFilterType.SingleSelect,
  key: 'name',
  label: 'Name',
  query: 'name',
  options: [{ label: 'Test', value: 'test' }],
  placeholder: 'Filter by name',
};

const dateRangeFilter: IToolbarDateRangeFilter = {
  type: ToolbarFilterType.DateRange,
  key: 'period',
  label: 'Period',
  query: 'period',
  options: [
    { label: 'Last 7 days', value: 'last_7_days' },
    { label: 'Custom', value: 'custom', isCustom: true },
  ],
  placeholder: 'Filter by period',
};

const customPeriodFilter: IToolbarFilter = {
  type: ToolbarFilterType.DateRange,
  key: 'period',
  label: 'Period',
  query: 'period',
  options: [{ label: 'Custom', value: 'custom', isCustom: true }],
  placeholder: 'Filter by period',
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('queryString', () => {
  describe('getPeriodFilterParam', () => {
    test('returns undefined without period values', () => {
      expect(getPeriodFilterParam({}, dateRangeFilter)).toBeUndefined();
      expect(getPeriodFilterParam({ period: [] }, dateRangeFilter)).toBeUndefined();
    });

    test('uses the current date as end_date for a custom period with a start_date only', () => {
      const today = new Date().toISOString().split('T')[0];

      expect(
        getPeriodFilterParam({ period: ['custom', '2024-01-01'] }, customPeriodFilter)
      ).toEqual([
        ['period', 'custom'],
        ['start_date', '2024-01-01'],
        ['end_date', today],
      ]);
    });

    test('returns a custom period with start_date and end_date', () => {
      const filterState: IFilterState = { period: ['custom', '2024-01-01', '2024-01-31'] };

      expect(getPeriodFilterParam(filterState, customPeriodFilter)).toEqual([
        ['period', 'custom'],
        ['start_date', '2024-01-01'],
        ['end_date', '2024-01-31'],
      ]);
    });

    test.each([
      ['only 1 value', ['custom']],
      ['more than 3 values', ['custom', '2024-01-01', '2024-01-31', 'extra']],
    ])('returns undefined for a custom period with %s', (_, period) => {
      expect(getPeriodFilterParam({ period }, customPeriodFilter)).toBeUndefined();
    });

    test('returns a preset period without dates', () => {
      expect(getPeriodFilterParam({ period: ['last_30_days'] }, dateRangeFilter)).toEqual([
        ['period', 'last_30_days'],
      ]);
    });
  });

  describe('isRequiredFilterValid', () => {
    const requiredDateRangeFilter: IToolbarFilter = {
      type: ToolbarFilterType.DateRange,
      key: 'period',
      label: 'Period',
      query: 'period',
      options: [
        { label: 'Last 7 days', value: 'last_7_days' },
        { label: 'Custom', value: 'custom', isCustom: true },
      ],
      placeholder: 'Filter by period',
      isRequired: true,
    };

    test('should return true when filter has no isRequired property', () => {
      expect(isRequiredFilterValid(singleSelectFilter, {})).toBe(true);
    });

    test('should return true when isRequired is false', () => {
      const filter: IToolbarSingleSelectFilter = { ...singleSelectFilter, isRequired: false };
      expect(isRequiredFilterValid(filter, {})).toBe(true);
    });

    test('should return false when required filter has no values', () => {
      const filter: IToolbarSingleSelectFilter = { ...singleSelectFilter, isRequired: true };
      expect(isRequiredFilterValid(filter, {})).toBe(false);
    });

    test('should return false when required filter has an empty values array', () => {
      const filter: IToolbarSingleSelectFilter = { ...singleSelectFilter, isRequired: true };
      expect(isRequiredFilterValid(filter, { name: [] })).toBe(false);
    });

    test('should return true for a required non-DateRange filter with a value', () => {
      const filter: IToolbarSingleSelectFilter = { ...singleSelectFilter, isRequired: true };
      expect(isRequiredFilterValid(filter, { name: ['test'] })).toBe(true);
    });

    test('should return true for a required DateRange filter with a non-custom preset value', () => {
      expect(isRequiredFilterValid(requiredDateRangeFilter, { period: ['last_7_days'] })).toBe(
        true
      );
    });

    test('should return false for a required custom DateRange filter with only 1 value', () => {
      expect(isRequiredFilterValid(requiredDateRangeFilter, { period: ['custom'] })).toBe(false);
    });

    test('should return true for a required custom DateRange filter with valid ISO start and end dates', () => {
      expect(
        isRequiredFilterValid(requiredDateRangeFilter, {
          period: ['custom', '2024-01-01', '2024-01-31'],
        })
      ).toBe(true);
    });

    test('should return false for a required custom DateRange filter with an invalid ISO end date', () => {
      expect(
        isRequiredFilterValid(requiredDateRangeFilter, {
          period: ['custom', '2024-01-01', '01/31/2024'],
        })
      ).toBe(false);
    });

    test('should return false for a required custom DateRange filter with more than 3 values', () => {
      expect(
        isRequiredFilterValid(requiredDateRangeFilter, {
          period: ['custom', '2024-01-01', '2024-01-31', 'extra'],
        })
      ).toBe(false);
    });

    test('should return true for a required custom DateRange filter with a valid ISO start date', () => {
      expect(
        isRequiredFilterValid(requiredDateRangeFilter, { period: ['custom', '2024-01-01'] })
      ).toBe(true);
    });

    test('should return false for a required custom DateRange filter with a non-ISO date string', () => {
      expect(
        isRequiredFilterValid(requiredDateRangeFilter, { period: ['custom', '01/01/2024'] })
      ).toBe(false);
    });

    test('should return false for a required custom DateRange filter with an invalid calendar date', () => {
      expect(
        isRequiredFilterValid(requiredDateRangeFilter, { period: ['custom', '2024-13-45'] })
      ).toBe(false);
    });

    test('should return false when start date is after end date', () => {
      expect(
        isRequiredFilterValid(requiredDateRangeFilter, {
          period: ['custom', '2024-01-31', '2024-01-01'],
        })
      ).toBe(false);
    });

    test('should return true when start date equals end date', () => {
      expect(
        isRequiredFilterValid(requiredDateRangeFilter, {
          period: ['custom', '2024-01-15', '2024-01-15'],
        })
      ).toBe(true);
    });

    test('should return false when only a start date after today is provided (end defaults to today)', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));
      try {
        expect(
          isRequiredFilterValid(requiredDateRangeFilter, { period: ['custom', '2024-06-16'] })
        ).toBe(false);
      } finally {
        vi.useRealTimers();
      }
    });

    test('should return true when only a start date of today is provided (end defaults to today)', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));
      try {
        expect(
          isRequiredFilterValid(requiredDateRangeFilter, { period: ['custom', '2024-06-15'] })
        ).toBe(true);
      } finally {
        vi.useRealTimers();
      }
    });

    describe('timezones west of UTC', () => {
      const originalTz = process.env.TZ;

      beforeEach(() => {
        process.env.TZ = 'America/Los_Angeles'; // UTC-8
      });

      afterEach(() => {
        process.env.TZ = originalTz;
      });

      test('should return true for a required custom DateRange filter with a valid ISO start date', () => {
        expect(
          isRequiredFilterValid(requiredDateRangeFilter, { period: ['custom', '2024-01-01'] })
        ).toBe(true);
      });

      test('should return true for a required custom DateRange filter with valid ISO start and end dates', () => {
        expect(
          isRequiredFilterValid(requiredDateRangeFilter, {
            period: ['custom', '2024-01-01', '2024-01-31'],
          })
        ).toBe(true);
      });

      test('should return true for dates spanning a UTC day boundary (Dec 31 / Jan 1)', () => {
        expect(
          isRequiredFilterValid(requiredDateRangeFilter, {
            period: ['custom', '2023-12-31', '2024-01-01'],
          })
        ).toBe(true);
      });
    });
  });

  describe('hasValidRequiredFilters', () => {
    test('should return true when there are no toolbar filters', () => {
      expect(hasValidRequiredFilters([], {})).toBe(true);
    });

    test('should return true when all required filters are valid', () => {
      const filters: IToolbarFilter[] = [
        { ...singleSelectFilter, isRequired: true },
        { ...dateRangeFilter },
      ];
      expect(hasValidRequiredFilters(filters, { name: ['test'] })).toBe(true);
    });

    test('should return false when any required filter is invalid', () => {
      const filters: IToolbarFilter[] = [
        { ...singleSelectFilter, isRequired: true },
        { ...dateRangeFilter, isRequired: true },
      ];
      expect(hasValidRequiredFilters(filters, { name: ['test'] })).toBe(false);
    });

    test('should return true when toolbarFilters is undefined', () => {
      expect(hasValidRequiredFilters(undefined, { name: ['test'] })).toBe(true);
    });

    test('should return true when filterState is undefined and no filter is required', () => {
      expect(hasValidRequiredFilters([singleSelectFilter])).toBe(true);
    });

    test('should return false when filterState is undefined and a filter is required', () => {
      const filters: IToolbarFilter[] = [{ ...singleSelectFilter, isRequired: true }];
      expect(hasValidRequiredFilters(filters)).toBe(false);
    });

    test('should return false when a required custom date range is missing its start date', () => {
      const requiredDateRangeFilter: IToolbarFilter = { ...dateRangeFilter, isRequired: true };
      expect(hasValidRequiredFilters([requiredDateRangeFilter], { period: ['custom'] })).toBe(
        false
      );
    });

    test('should return true when a required custom date range has a valid start date', () => {
      const requiredDateRangeFilter: IToolbarFilter = { ...dateRangeFilter, isRequired: true };
      expect(
        hasValidRequiredFilters([requiredDateRangeFilter], { period: ['custom', '2024-01-01'] })
      ).toBe(true);
    });
  });
});
