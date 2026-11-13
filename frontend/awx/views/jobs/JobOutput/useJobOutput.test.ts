import { act, renderHook, waitFor } from '@testing-library/react';
import {
  DateRangeFilterPresets,
  ToolbarFilterType,
  type IFilterState,
  type IToolbarFilter,
} from '@ansible/ansible-ui-framework';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { requestGet } from '@ansible/common-ui/crud/Data';
import type { Job } from '../../../interfaces/Job';
import {
  applyBatchedEvents,
  getFiltersQueryString,
  mergeJobEvents,
  useJobOutput,
} from './useJobOutput';
import type { JobEvent } from '../../../interfaces/JobEvent';

const mockWebSocketSubscription = vi.hoisted(() => vi.fn());

vi.mock('../../../common/useAwxWebSocket', () => ({
  useAwxWebSocketSubscription: mockWebSocketSubscription,
}));

vi.mock('@ansible/common-ui/crud/Data', () => ({
  requestGet: vi.fn(),
}));

const textFilter = {
  key: 'search',
  label: 'Search',
  type: ToolbarFilterType.MultiText,
  query: 'search',
  placeholder: 'Search',
  comparison: 'contains',
} as IToolbarFilter;

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

const dateRangeFilter = {
  key: 'created',
  label: 'Created',
  type: ToolbarFilterType.DateRange,
  query: 'created',
  placeholder: 'Created',
  options: [],
} as unknown as IToolbarFilter;

describe('applyBatchedEvents', () => {
  const makeEvent = (counter: number) => ({ counter }) as JobEvent;

  it('should return a new object without mutating the input', () => {
    const existing: Record<number, JobEvent> = { 1: makeEvent(1) };
    const result = applyBatchedEvents(existing, [makeEvent(2)]);

    expect(result).not.toBe(existing);
    expect(existing[2]).toBeUndefined();
    expect(result[2]).toEqual(makeEvent(2));
  });

  it('should merge new events into existing events by counter', () => {
    const existing: Record<number, JobEvent> = { 1: makeEvent(1), 2: makeEvent(2) };
    const result = applyBatchedEvents(existing, [makeEvent(3), makeEvent(4)]);

    expect(result[1]).toEqual(makeEvent(1));
    expect(result[2]).toEqual(makeEvent(2));
    expect(result[3]).toEqual(makeEvent(3));
    expect(result[4]).toEqual(makeEvent(4));
  });

  it('should overwrite existing events with the same counter', () => {
    const oldEvent = { counter: 1, stdout: 'old' } as unknown as JobEvent;
    const newEvent = { counter: 1, stdout: 'new' } as unknown as JobEvent;
    const existing: Record<number, JobEvent> = { 1: oldEvent };

    const result = applyBatchedEvents(existing, [newEvent]);

    expect(result[1]).toBe(newEvent);
  });

  it('should return a shallow copy when newEvents is empty', () => {
    const existing: Record<number, JobEvent> = { 1: makeEvent(1) };
    const result = applyBatchedEvents(existing, []);

    expect(result).not.toBe(existing);
    expect(result).toEqual(existing);
  });
});

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

describe('mergeJobEvents', () => {
  const makeEvent = (counter: number) => ({ counter }) as JobEvent;

  it('merges unfiltered events by counter', () => {
    const result = mergeJobEvents({ 1: makeEvent(1) }, [makeEvent(2)], false);

    expect(result).toEqual({ 1: makeEvent(1), 2: makeEvent(2) });
  });

  it('appends filtered events after existing events', () => {
    const result = mergeJobEvents({ 1: makeEvent(1) }, [makeEvent(7)], true);

    expect(result).toEqual({ 1: makeEvent(1), 2: makeEvent(7) });
  });
});

describe('useJobOutput', () => {
  const job = { id: 7, type: 'job', status: 'successful' } as Job;
  const reloadJob = vi.fn();
  const toolbarFilters: IToolbarFilter[] = [];
  const filterState: IFilterState = {};

  beforeEach(() => {
    vi.mocked(requestGet).mockReset();
    mockWebSocketSubscription.mockReset();
  });

  it('merges fetched events into the current event map', async () => {
    const initialEvent = { counter: 1 } as JobEvent;
    const fetchedEvent = { counter: 2 } as JobEvent;
    vi.mocked(requestGet)
      .mockResolvedValueOnce({ results: [initialEvent], count: 1 } as never)
      .mockResolvedValueOnce({ results: [initialEvent, fetchedEvent], count: 2 } as never);

    const { result } = renderHook(() =>
      useJobOutput(job, reloadJob, toolbarFilters, filterState, 10)
    );
    await waitFor(() => expect(requestGet).toHaveBeenCalledTimes(1));

    void act(() => {
      result.current.queryJobOutputEvent(1);
    });

    await waitFor(() => expect(result.current.jobEvents[2]).toBe(fetchedEvent));
    expect(result.current.jobEvents[1]).toBe(initialEvent);
  });

  it('applies a batch of websocket events after the debounce timeout', async () => {
    vi.useFakeTimers();
    const initialEvent = { counter: 1 } as JobEvent;
    vi.mocked(requestGet).mockResolvedValue({ results: [initialEvent], count: 1 } as never);
    const { result } = renderHook(() =>
      useJobOutput(job, reloadJob, toolbarFilters, filterState, 10)
    );
    await act(async () => {
      await Promise.resolve();
    });
    const handleMessage = mockWebSocketSubscription.mock.calls[0]?.[1] as
      | ((message: unknown) => void)
      | undefined;
    expect(handleMessage).toBeDefined();

    act(() => {
      handleMessage?.({ group_name: 'job_events', counter: 2 });
      handleMessage?.({ group_name: 'job_events', counter: 3 });
    });
    await act(() => vi.advanceTimersByTime(500));

    expect(result.current.jobEvents[2]).toEqual({ group_name: 'job_events', counter: 2 });
    expect(result.current.jobEvents[3]).toEqual({ group_name: 'job_events', counter: 3 });
    expect(result.current.jobEventCount).toBe(3);
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });
});
