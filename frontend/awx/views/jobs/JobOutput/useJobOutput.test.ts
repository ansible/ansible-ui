import {
  DateRangeFilterPresets,
  ToolbarFilterType,
  type IFilterState,
  type IToolbarFilter,
} from '@ansible/ansible-ui-framework';
import { describe, expect, it, vi } from 'vitest';
import { getFiltersQueryString } from './useJobOutput';

const textFilter: IToolbarFilter = {
  key: 'search',
  label: 'Search',
  type: ToolbarFilterType.MultiText,
  query: 'search',
  placeholder: 'Search',
};

const choiceFilter: IToolbarFilter = {
  key: 'event',
  label: 'Event',
  type: ToolbarFilterType.MultiSelect,
  query: 'event',
  placeholder: 'Event',
  options: [
    { value: 'runner_on_ok', label: 'Host OK' },
    { value: 'runner_on_failed', label: 'Host Failed' },
  ],
};

const dateRangeFilter: IToolbarFilter = {
  key: 'created',
  label: 'Created',
  type: ToolbarFilterType.DateRange,
  query: 'created',
  placeholder: 'Created',
};

describe('getFiltersQueryString', () => {
  it('should return empty string for null filterState', () => {
    expect(getFiltersQueryString([textFilter], null as unknown as IFilterState)).toBe('');
  });

  it('should return empty string for empty filterState', () => {
    expect(getFiltersQueryString([textFilter], {})).toBe('');
  });

  it('should return empty string when filter key has no matching toolbar filter', () => {
    const filterState: IFilterState = { unknown_key: ['value'] };
    expect(getFiltersQueryString([textFilter], filterState)).toBe('');
  });

  it('should return empty string when filter values are empty', () => {
    const filterState: IFilterState = { search: [] };
    expect(getFiltersQueryString([textFilter], filterState)).toBe('');
  });

  it('should return query string for single value', () => {
    const filterState: IFilterState = { search: ['hello'] };
    const result = getFiltersQueryString([textFilter], filterState);

    expect(result).toBe('search=hello');
  });

  it('should use or__ prefix for multiple values', () => {
    const filterState: IFilterState = { event: ['runner_on_ok', 'runner_on_failed'] };
    const result = getFiltersQueryString([choiceFilter], filterState);

    expect(result).toBe('or__event=runner_on_ok&or__event=runner_on_failed');
  });

  it('should join multiple filter keys with &', () => {
    const filterState: IFilterState = {
      search: ['hello'],
      event: ['runner_on_ok'],
    };
    const result = getFiltersQueryString([textFilter, choiceFilter], filterState);

    expect(result).toBe('search=hello&event=runner_on_ok');
  });

  it('should handle DateRange filter with LastHour preset', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-25T12:00:00.000Z'));

    const filterState: IFilterState = { created: [DateRangeFilterPresets.LastHour] };
    const result = getFiltersQueryString([dateRangeFilter], filterState);

    expect(result).toContain('created__gte=');
    expect(result).toContain('2026-06-25T11:00:00.000Z');
    vi.useRealTimers();
  });

  it('should handle DateRange filter with Last24Hours preset', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-25T12:00:00.000Z'));

    const filterState: IFilterState = { created: [DateRangeFilterPresets.Last24Hours] };
    const result = getFiltersQueryString([dateRangeFilter], filterState);

    expect(result).toContain('created__gte=');
    expect(result).toContain('2026-06-24T12:00:00.000Z');
    vi.useRealTimers();
  });

  it('should handle DateRange filter with LastWeek preset', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-25T12:00:00.000Z'));

    const filterState: IFilterState = { created: [DateRangeFilterPresets.LastWeek] };
    const result = getFiltersQueryString([dateRangeFilter], filterState);

    expect(result).toContain('created__gte=');
    expect(result).toContain('2026-06-18T12:00:00.000Z');
    vi.useRealTimers();
  });

  it('should handle DateRange filter with LastMonth preset', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-25T12:00:00.000Z'));

    const filterState: IFilterState = { created: [DateRangeFilterPresets.LastMonth] };
    const result = getFiltersQueryString([dateRangeFilter], filterState);

    expect(result).toContain('created__gte=');
    expect(result).toContain('2026-05-26T12:00:00.000Z');
    vi.useRealTimers();
  });

  it('should handle undefined values gracefully', () => {
    const filterState: IFilterState = { search: undefined as unknown as string[] };
    expect(getFiltersQueryString([textFilter], filterState)).toBe('');
  });

  it('should handle empty toolbar filters array', () => {
    const filterState: IFilterState = { search: ['hello'] };
    expect(getFiltersQueryString([], filterState)).toBe('');
  });
});
