/* eslint-disable i18next/no-literal-string */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import {
  IFilterState,
  IToolbarDateRangeFilter,
  IToolbarFilter,
  IToolbarSingleSelectFilter,
  IView,
  ToolbarFilterType,
} from '@ansible/ansible-ui-framework';
import {
  filtersToSearchObj,
  getQueryString,
  hasValidRequiredFilters,
  isRequiredFilterValid,
} from './queryString';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockView: IView = {
  page: 1,
  perPage: 10,
  sort: 'name',
  sortDirection: 'asc',
  filterState: {},
  setPage: vi.fn(),
  setPerPage: vi.fn(),
  setSort: vi.fn(),
  setSortDirection: vi.fn(),
  setFilterState: vi.fn(),
  clearAllFilters: vi.fn(),
};

const mockToolbarFilters: IToolbarFilter[] = [
  {
    type: ToolbarFilterType.SingleText,
    key: 'name',
    label: 'Name',
    query: 'name__icontains',
    placeholder: 'Filter by name',
    comparison: 'contains',
  },
  {
    type: ToolbarFilterType.DateRange,
    key: 'period',
    label: 'Period',
    query: 'period',
    options: [
      { label: 'Last 7 days', value: 'last_7_days' },
      { label: 'Custom', value: 'custom', isCustom: true },
    ],
    placeholder: 'Filter by period',
  },
];

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
  describe('getQueryString', () => {
    // --- Basic query string building ---

    test('should build query string with pagination parameters', () => {
      const result = getQueryString(mockView, [], {});

      expect(result).toContain('page=1');
      expect(result).toContain('page_size=10');
    });

    test('should include sort parameter when sort is defined (ascending)', () => {
      const result = getQueryString(mockView, [], {});

      expect(result).toContain('order_by=name');
      expect(result).not.toContain('order_by=-name');
    });

    test('should include sort parameter with negative prefix for descending order', () => {
      const view: IView = {
        ...mockView,
        sortDirection: 'desc',
      };

      const result = getQueryString(view, [], {});

      expect(result).toContain('order_by=-name');
    });

    test('should include query parameters from queryParams', () => {
      const queryParams = { tz: 'UTC', custom: 'value' };

      const result = getQueryString(mockView, [], queryParams);

      expect(result).toContain('tz=UTC');
      expect(result).toContain('custom=value');
    });

    test('should include filters from filterState', () => {
      const view: IView = {
        ...mockView,
        filterState: { name: ['test'] },
      };
      const filters: IToolbarFilter[] = [
        {
          type: ToolbarFilterType.SingleText,
          key: 'name',
          label: 'Name',
          query: 'name__icontains',
          placeholder: 'Filter by name',
          comparison: 'contains',
        },
      ];

      const result = getQueryString(view, filters, {});

      expect(result).toContain('name__icontains=test');
    });

    test('should return properly formatted query string with all parameters combined', () => {
      const view: IView = {
        ...mockView,
        page: 2,
        perPage: 20,
        sort: 'created',
        sortDirection: 'desc',
        filterState: { name: ['test'] },
      };
      const filters: IToolbarFilter[] = [
        {
          type: ToolbarFilterType.SingleText,
          key: 'name',
          label: 'Name',
          query: 'name__icontains',
          placeholder: 'Filter by name',
          comparison: 'contains',
        },
      ];

      const result = getQueryString(view, filters, { tz: 'UTC' });

      expect(result).toMatch(/^\?/); // Starts with ?
      expect(result).toContain('page=2');
      expect(result).toContain('page_size=20');
      expect(result).toContain('order_by=-created');
      expect(result).toContain('name__icontains=test');
      expect(result).toContain('tz=UTC');
    });

    test('should not add order_by if already present in query params', () => {
      const view: IView = {
        ...mockView,
        sort: 'name',
      };

      const result = getQueryString(view, [], { order_by: 'custom' });

      // Should only have one order_by parameter
      const orderByMatches = result.match(/order_by=/g);
      expect(orderByMatches?.length).toBe(1);
      expect(result).toContain('order_by=custom');
    });

    test('should handle undefined sort gracefully', () => {
      const view: IView = {
        ...mockView,
        sort: '',
      };

      const result = getQueryString(view, [], {});

      expect(result).toContain('page=1');
      expect(result).toContain('page_size=10');
      expect(result).not.toContain('order_by');
    });
  });

  describe('filtersToSearchObj', () => {
    // --- Basic functionality ---

    test('should return empty params when filterState is empty', () => {
      const params = filtersToSearchObj([], {});

      expect(params.toString()).toBe('');
    });

    test('should handle DateRange filter type correctly', () => {
      const filterState: IFilterState = { period: ['last_7_days'] };
      const filters: IToolbarFilter[] = [
        {
          type: ToolbarFilterType.DateRange,
          key: 'period',
          label: 'Period',
          query: 'period',
          options: [{ label: 'Last 7 days', value: 'last_7_days' }],
          placeholder: 'Filter by period',
        },
      ];

      const params = filtersToSearchObj(filters, filterState);

      expect(params.get('period')).toBe('last_7_days');
    });

    test('should handle non-DateRange filters with single value', () => {
      const filterState: IFilterState = { name: ['test'] };
      const filters: IToolbarFilter[] = [
        {
          type: ToolbarFilterType.SingleText,
          key: 'name',
          label: 'Name',
          query: 'name__icontains',
          placeholder: 'Filter by name',
          comparison: 'contains',
        },
      ];

      const params = filtersToSearchObj(filters, filterState);

      expect(params.get('name__icontains')).toBe('test');
    });

    test('should handle non-DateRange filters with multiple values', () => {
      const filterState: IFilterState = { status: ['active', 'pending'] };
      const filters: IToolbarFilter[] = [
        {
          type: ToolbarFilterType.MultiSelect,
          key: 'status',
          label: 'Status',
          query: 'status__in',
          options: [],
          placeholder: 'Filter by status',
        },
      ];

      const params = filtersToSearchObj(filters, filterState);

      expect(params.getAll('status__in')).toEqual(['active', 'pending']);
    });

    test('should skip filters with no matching toolbarFilter', () => {
      const filterState: IFilterState = { unknown: ['value'] };

      const params = filtersToSearchObj([], filterState);

      expect(params.toString()).toBe('');
    });

    test('should handle mixed empty and valid values', () => {
      const filterState: IFilterState = { name: ['', 'test', '', 'value'] };
      const filters: IToolbarFilter[] = [
        {
          type: ToolbarFilterType.SingleText,
          key: 'name',
          label: 'Name',
          query: 'name__icontains',
          placeholder: 'Filter by name',
          comparison: 'contains',
        },
      ];

      const params = filtersToSearchObj(filters, filterState);

      // Function keeps empty strings as valid values
      expect(params.getAll('name__icontains')).toEqual(['', 'test', '', 'value']);
    });
  });

  describe('getPeriodFilterParam (via filtersToSearchObj)', () => {
    // --- Period filter edge cases ---

    test('should return undefined when filter is undefined', () => {
      const filterState: IFilterState = { unknown: ['value'] };

      const params = filtersToSearchObj(mockToolbarFilters, filterState);

      expect(params.toString()).toBe('');
    });

    test('should return undefined when values array is empty', () => {
      const filterState: IFilterState = { period: [] };

      const params = filtersToSearchObj(mockToolbarFilters, filterState);

      expect(params.get('period')).toBeNull();
    });

    test('should return undefined when all values are empty strings', () => {
      const filterState: IFilterState = { period: ['', ''] };

      const params = filtersToSearchObj(mockToolbarFilters, filterState);

      expect(params.get('period')).toBeNull();
    });

    test('should handle custom period with start_date only (uses current date as end_date)', () => {
      const filterState: IFilterState = { period: ['custom', '2024-01-01'] };
      const filters: IToolbarFilter[] = [customPeriodFilter];

      const params = filtersToSearchObj(filters, filterState);

      expect(params.get('period')).toBe('custom');
      expect(params.get('start_date')).toBe('2024-01-01');
      expect(params.get('end_date')).toBeTruthy();
      // Verify end_date is current date
      const endDate = params.get('end_date');
      const today = new Date().toISOString().split('T')[0];
      expect(endDate).toBe(today);
    });

    test('should handle custom period with start_date and end_date', () => {
      const filterState: IFilterState = { period: ['custom', '2024-01-01', '2024-01-31'] };
      const filters: IToolbarFilter[] = [customPeriodFilter];

      const params = filtersToSearchObj(filters, filterState);

      expect(params.get('period')).toBe('custom');
      expect(params.get('start_date')).toBe('2024-01-01');
      expect(params.get('end_date')).toBe('2024-01-31');
    });

    test('should return undefined for custom period with only 1 value', () => {
      const filterState: IFilterState = { period: ['custom'] };
      const filters: IToolbarFilter[] = [customPeriodFilter];

      const params = filtersToSearchObj(filters, filterState);

      expect(params.get('period')).toBeNull();
      expect(params.get('start_date')).toBeNull();
      expect(params.get('end_date')).toBeNull();
    });

    test('should handle non-custom period values', () => {
      const filterState: IFilterState = { period: ['last_30_days'] };
      const filters: IToolbarFilter[] = [
        {
          type: ToolbarFilterType.DateRange,
          key: 'period',
          label: 'Period',
          query: 'period',
          options: [{ label: 'Last 30 days', value: 'last_30_days' }],
          placeholder: 'Filter by period',
        },
      ];

      const params = filtersToSearchObj(filters, filterState);

      expect(params.get('period')).toBe('last_30_days');
      expect(params.get('start_date')).toBeNull();
      expect(params.get('end_date')).toBeNull();
    });
  });

  describe('getFilterParam (via filtersToSearchObj)', () => {
    // --- Generic filter parameter tests ---

    test('should return undefined when filter is undefined', () => {
      const filterState: IFilterState = { unknown: ['value'] };

      const params = filtersToSearchObj([], filterState);

      expect(params.toString()).toBe('');
    });

    test('should return undefined when values array is empty', () => {
      const filterState: IFilterState = { name: [] };

      const params = filtersToSearchObj(mockToolbarFilters, filterState);

      expect(params.get('name__icontains')).toBeNull();
    });

    test('should return empty string when all values are empty strings', () => {
      const filterState: IFilterState = { name: ['', ''] };

      const params = filtersToSearchObj(mockToolbarFilters, filterState);

      expect(params.get('name__icontains')).toBe('');
    });

    test('should return single value when array has one element', () => {
      const filterState: IFilterState = { name: ['single'] };
      const filters: IToolbarFilter[] = [
        {
          type: ToolbarFilterType.SingleText,
          key: 'name',
          label: 'Name',
          query: 'name__icontains',
          placeholder: 'Filter by name',
          comparison: 'contains',
        },
      ];

      const params = filtersToSearchObj(filters, filterState);

      expect(params.get('name__icontains')).toBe('single');
    });

    test('should return array of values when array has multiple elements', () => {
      const filterState: IFilterState = { status: ['active', 'pending', 'completed'] };
      const filters: IToolbarFilter[] = [
        {
          type: ToolbarFilterType.MultiSelect,
          key: 'status',
          label: 'Status',
          query: 'status__in',
          options: [],
          placeholder: 'Filter by status',
        },
      ];

      const params = filtersToSearchObj(filters, filterState);

      expect(params.getAll('status__in')).toEqual(['active', 'pending', 'completed']);
    });
  });

  describe('Edge Cases', () => {
    test('should handle multiple filters simultaneously', () => {
      const filterState: IFilterState = {
        name: ['test'],
        period: ['last_7_days'],
        status: ['active', 'pending'],
      };
      const filters: IToolbarFilter[] = [
        {
          type: ToolbarFilterType.SingleText,
          key: 'name',
          label: 'Name',
          query: 'name__icontains',
          placeholder: 'Filter by name',
          comparison: 'contains',
        },
        {
          type: ToolbarFilterType.DateRange,
          key: 'period',
          label: 'Period',
          query: 'period',
          options: [{ label: 'Last 7 days', value: 'last_7_days' }],
          placeholder: 'Filter by period',
        },
        {
          type: ToolbarFilterType.MultiSelect,
          key: 'status',
          label: 'Status',
          query: 'status__in',
          options: [],
          placeholder: 'Filter by status',
        },
      ];

      const params = filtersToSearchObj(filters, filterState);

      expect(params.get('name__icontains')).toBe('test');
      expect(params.get('period')).toBe('last_7_days');
      expect(params.getAll('status__in')).toEqual(['active', 'pending']);
    });

    test('should keep empty strings with non-empty strings', () => {
      const filterState: IFilterState = { name: ['', '', 'valid', ''] };
      const filters: IToolbarFilter[] = [
        {
          type: ToolbarFilterType.SingleText,
          key: 'name',
          label: 'Name',
          query: 'name__icontains',
          placeholder: 'Filter by name',
          comparison: 'contains',
        },
      ];

      const params = filtersToSearchObj(filters, filterState);

      // Function keeps all empty strings and non-empty strings
      expect(params.getAll('name__icontains')).toEqual(['', '', 'valid', '']);
    });

    test('should return undefined for custom date range with more than 3 values', () => {
      const filterState: IFilterState = {
        period: ['custom', '2024-01-01', '2024-01-31', 'extra'],
      };
      const filters: IToolbarFilter[] = [customPeriodFilter];

      const params = filtersToSearchObj(filters, filterState);

      // Function only handles exactly 2 or 3 values for custom, so 4+ returns undefined
      expect(params.get('period')).toBeNull();
      expect(params.get('start_date')).toBeNull();
      expect(params.get('end_date')).toBeNull();
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
