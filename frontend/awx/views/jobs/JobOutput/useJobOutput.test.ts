import {
  DateRangeFilterPresets,
  ToolbarFilterType,
  type IFilterState,
  type IToolbarFilter,
} from '@ansible/ansible-ui-framework';
import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { applyBatchedEvents, getFiltersQueryString, useJobOutput } from './useJobOutput';
import type { JobEvent } from '../../../interfaces/JobEvent';
import type { Job } from '../../../interfaces/Job';
import { testFixture as jobFixture } from '../jobDetails.fixture';

vi.mock('../../../common/useAwxWebSocket', () => ({
  useAwxWebSocketSubscription: () => undefined,
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

  it('should keep a custom date value on a date-range filter', () => {
    const filterState: IFilterState = { created: ['2020-01-01T00:00:00.000Z'] };
    expect(getFiltersQueryString([dateRangeFilter], filterState)).toBe(
      'created__gte=2020-01-01T00:00:00.000Z'
    );
  });
});

const requestedUrls: string[] = [];

const isEventsRequest = ({ request }: { request: Request }) =>
  request.url.includes('/api/v2/') && request.url.includes('events');

const server = setupServer(
  http.get(isEventsRequest, ({ request }) => {
    requestedUrls.push(request.url);
    const url = new URL(request.url);
    if (url.searchParams.get('order_by') === '-counter') {
      return HttpResponse.json({ count: 1, results: [{ id: 1, counter: 8, stdout: 'latest' }] });
    }
    if (url.searchParams.has('counter__gte')) {
      return HttpResponse.json({
        count: 1,
        results: [
          {
            id: 2,
            counter: Number(url.searchParams.get('counter__gte')),
            stdout: 'gap',
          },
        ],
      });
    }
    return HttpResponse.json({
      count: 2,
      results: [
        { id: 3, counter: 1, stdout: 'one' },
        { id: 4, counter: 9, stdout: 'nine' },
      ],
    });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => {
  vi.useRealTimers();
  server.resetHandlers();
  requestedUrls.length = 0;
});
afterAll(() => server.close());

function renderOutput(job: Job = jobFixture, filterState: IFilterState = {}, pageSize = 50) {
  return renderHook(
    ({ currentJob, filters }) => useJobOutput(currentJob, vi.fn(), [textFilter], filters, pageSize),
    { initialProps: { currentJob: job, filters: filterState } }
  );
}

describe('useJobOutput', () => {
  it('loads the latest event counter', async () => {
    const { result } = renderOutput();
    await waitFor(() => expect(result.current.jobEventCount).toBe(8));
  });

  it('ignores a failed counter lookup', async () => {
    server.use(
      http.get(isEventsRequest, ({ request }) => {
        requestedUrls.push(request.url);
        return HttpResponse.json({}, { status: 500 });
      })
    );
    const { result } = renderOutput();
    await waitFor(() => expect(requestedUrls.length).toBeGreaterThan(0));
    expect(result.current.jobEventCount).toBe(1);
  });

  it('fetches a page of events for a finished job and skips a second query while one is running', async () => {
    let release: (() => void) | undefined;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    server.use(
      http.get(isEventsRequest, async ({ request }) => {
        requestedUrls.push(request.url);
        const url = new URL(request.url);
        if (url.searchParams.get('order_by') === '-counter') {
          return HttpResponse.json({
            count: 1,
            results: [{ id: 1, counter: 3, stdout: 'latest' }],
          });
        }
        await gate;
        return HttpResponse.json({
          count: 1,
          results: [{ id: 3, counter: 1, stdout: 'one' }],
        });
      })
    );
    const { result } = renderOutput();
    await waitFor(() => expect(result.current.jobEventCount).toBe(3));
    const before = requestedUrls.length;
    act(() => {
      result.current.queryJobOutputEvent(1);
      result.current.queryJobOutputEvent(2);
    });
    await waitFor(() => expect(requestedUrls.length).toBe(before + 1));
    expect(requestedUrls.at(-1)).toContain('order_by=counter');
    expect(requestedUrls.at(-1)).not.toContain('search=');
    act(() => {
      release?.();
    });
    await waitFor(() => expect(result.current.getJobOutputEvent(1)?.stdout).toBe('one'));
    const afterLoad = requestedUrls.length;
    act(() => {
      result.current.queryJobOutputEvent(1);
    });
    expect(requestedUrls.length).toBe(afterLoad);
  });

  it('stores filtered events by position and resets them when filters change', async () => {
    const { result, rerender } = renderOutput(jobFixture, { search: ['hello'] });
    await waitFor(() => expect(result.current.jobEventCount).toBe(8));
    act(() => {
      result.current.queryJobOutputEvent(1);
    });
    await waitFor(() => expect(result.current.getJobOutputEvent(1)?.stdout).toBe('one'));
    expect(result.current.getJobOutputEvent(2)?.stdout).toBe('nine');

    rerender({ currentJob: jobFixture, filters: { search: ['other'] } });
    await waitFor(() => expect(result.current.jobEvents).toEqual({}));
  });
});
