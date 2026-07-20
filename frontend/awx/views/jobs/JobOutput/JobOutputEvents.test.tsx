import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { SWRConfig } from 'swr';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { JobEvent } from '../../../interfaces/JobEvent';
import { testFixture as jobFixture } from '../jobDetails.fixture';
import { JobOutputEvents } from './JobOutputEvents';
import * as JobOutputRowModule from './JobOutputRow';
import { useJobOutput } from './useJobOutput';

vi.mock('@react-hook/resize-observer', () => ({
  default: vi.fn(),
}));

vi.mock('./useJobOutput', () => ({
  useJobOutput: vi.fn(() => ({
    jobEventCount: 0,
    getJobOutputEvent: vi.fn(),
    queryJobOutputEvent: vi.fn(),
    jobEvents: {},
  })),
}));

const childrenSummaryUrl = ({ request }: { request: Request }) =>
  request.url.includes('children_summary');

const server = setupServer(
  http.get(childrenSummaryUrl, () =>
    HttpResponse.json({
      children_summary: { '1': { rowNumber: 1, numChildren: 3 } },
      meta_event_nested_uuid: {},
      event_processing_finished: true,
      is_tree: true,
    })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderJobOutput(job: typeof jobFixture) {
  return render(
    <SWRConfig value={{ provider: () => new Map() }}>
      <JobOutputEvents
        job={job}
        reloadJob={vi.fn()}
        toolbarFilters={[]}
        filterState={{}}
        isFollowModeEnabled={false}
        setIsFollowModeEnabled={vi.fn()}
      />
    </SWRConfig>
  );
}

describe('JobOutputEvents', () => {
  it('should render scroll controls', () => {
    renderJobOutput(jobFixture);

    expect(screen.getByRole('button', { name: 'Scroll first' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Scroll last' })).toBeInTheDocument();
  });

  it('should hide expand/collapse button when job is running (flat mode)', () => {
    const runningJob = { ...jobFixture, status: 'running' as const };
    renderJobOutput(runningJob);

    expect(
      screen.queryByRole('button', { name: /expand job events|collapse all job events/i })
    ).not.toBeInTheDocument();
  });

  it('should keep expand/collapse button hidden after a running job completes', () => {
    const runningJob = { ...jobFixture, status: 'running' as const };
    const { rerender } = renderJobOutput(runningJob);

    expect(
      screen.queryByRole('button', { name: /expand job events|collapse all job events/i })
    ).not.toBeInTheDocument();

    const completedJob = { ...jobFixture, status: 'successful' as const };
    rerender(
      <SWRConfig value={{ provider: () => new Map() }}>
        <JobOutputEvents
          job={completedJob}
          reloadJob={vi.fn()}
          toolbarFilters={[]}
          filterState={{}}
          isFollowModeEnabled={false}
          setIsFollowModeEnabled={vi.fn()}
        />
      </SWRConfig>
    );

    expect(
      screen.queryByRole('button', { name: /expand job events|collapse all job events/i })
    ).not.toBeInTheDocument();
  });

  it('should show expand/collapse button when job was already completed on mount', async () => {
    renderJobOutput(jobFixture);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /expand job events|collapse all job events/i })
      ).toBeInTheDocument();
    });
  });

  it('should cache jobEventToRows results across re-renders', () => {
    const jobEventToRowsSpy = vi.spyOn(JobOutputRowModule, 'jobEventToRows');

    const event1 = {
      counter: 1,
      stdout: 'PLAY [all] ***\r\nline2',
      uuid: 'uuid-1',
      event: 'playbook_on_play_start',
      event_data: { play_uuid: 'play-1' },
      start_line: 0,
      parent_uuid: '',
      summary_fields: { job: { id: 1 } },
    } as unknown as JobEvent;

    const jobEvents: Record<number, JobEvent> = { 1: event1 };
    const stableReloadJob = vi.fn();
    const stableSetFollow = vi.fn();
    const stableFilterState = {};
    const swrConfig = { provider: () => new Map() };

    vi.mocked(useJobOutput).mockReturnValue({
      jobEventCount: 1,
      getJobOutputEvent: vi.fn(),
      queryJobOutputEvent: vi.fn(),
      jobEvents,
    });

    const { rerender } = render(
      <SWRConfig value={swrConfig}>
        <JobOutputEvents
          job={jobFixture}
          reloadJob={stableReloadJob}
          toolbarFilters={[]}
          filterState={stableFilterState}
          isFollowModeEnabled={false}
          setIsFollowModeEnabled={stableSetFollow}
        />
      </SWRConfig>
    );

    const firstCallCount = jobEventToRowsSpy.mock.calls.length;
    expect(firstCallCount).toBe(1);

    vi.mocked(useJobOutput).mockReturnValue({
      jobEventCount: 1,
      getJobOutputEvent: vi.fn(),
      queryJobOutputEvent: vi.fn(),
      jobEvents,
    });

    rerender(
      <SWRConfig value={swrConfig}>
        <JobOutputEvents
          job={jobFixture}
          reloadJob={stableReloadJob}
          toolbarFilters={[]}
          filterState={stableFilterState}
          isFollowModeEnabled={false}
          setIsFollowModeEnabled={stableSetFollow}
        />
      </SWRConfig>
    );

    expect(jobEventToRowsSpy.mock.calls.length).toBe(firstCallCount);

    jobEventToRowsSpy.mockRestore();
  });

  it('should only call jobEventToRows for new events when count increases', () => {
    const jobEventToRowsSpy = vi.spyOn(JobOutputRowModule, 'jobEventToRows');

    const event1 = {
      counter: 1,
      stdout: 'PLAY [all] ***',
      uuid: 'uuid-1',
      event: 'playbook_on_play_start',
      event_data: { play_uuid: 'play-1' },
      start_line: 0,
      parent_uuid: '',
      summary_fields: { job: { id: 1 } },
    } as unknown as JobEvent;
    const event2 = {
      counter: 2,
      stdout: 'TASK [debug] ***',
      uuid: 'uuid-2',
      event: 'playbook_on_task_start',
      event_data: { play_uuid: 'play-1', task_uuid: 'task-1' },
      start_line: 1,
      parent_uuid: '',
      summary_fields: { job: { id: 1 } },
    } as unknown as JobEvent;

    const stableFilterState = {};
    const stableReloadJob = vi.fn();
    const stableSetFollow = vi.fn();
    const swrConfig = { provider: () => new Map() };

    vi.mocked(useJobOutput).mockReturnValue({
      jobEventCount: 1,
      getJobOutputEvent: vi.fn(),
      queryJobOutputEvent: vi.fn(),
      jobEvents: { 1: event1 },
    });

    const { rerender } = render(
      <SWRConfig value={swrConfig}>
        <JobOutputEvents
          job={jobFixture}
          reloadJob={stableReloadJob}
          toolbarFilters={[]}
          filterState={stableFilterState}
          isFollowModeEnabled={false}
          setIsFollowModeEnabled={stableSetFollow}
        />
      </SWRConfig>
    );
    const callsAfterFirstRender = jobEventToRowsSpy.mock.calls.length;
    expect(callsAfterFirstRender).toBeGreaterThanOrEqual(1);

    jobEventToRowsSpy.mockClear();

    vi.mocked(useJobOutput).mockReturnValue({
      jobEventCount: 2,
      getJobOutputEvent: vi.fn(),
      queryJobOutputEvent: vi.fn(),
      jobEvents: { 1: event1, 2: event2 },
    });

    rerender(
      <SWRConfig value={swrConfig}>
        <JobOutputEvents
          job={jobFixture}
          reloadJob={stableReloadJob}
          toolbarFilters={[]}
          filterState={stableFilterState}
          isFollowModeEnabled={false}
          setIsFollowModeEnabled={stableSetFollow}
        />
      </SWRConfig>
    );

    const callsForNewEvent = jobEventToRowsSpy.mock.calls.filter((args) => args[0]?.counter === 2);
    expect(callsForNewEvent.length).toBe(1);

    const callsForCachedEvent = jobEventToRowsSpy.mock.calls.filter(
      (args) => args[0]?.counter === 1
    );
    expect(callsForCachedEvent.length).toBe(0);

    jobEventToRowsSpy.mockRestore();
  });

  it('should invalidate cache when filterState changes', () => {
    const jobEventToRowsSpy = vi.spyOn(JobOutputRowModule, 'jobEventToRows');

    const event1 = {
      counter: 1,
      stdout: 'PLAY [all] ***',
      uuid: 'uuid-1',
      event: 'playbook_on_play_start',
      event_data: { play_uuid: 'play-1' },
      start_line: 0,
      parent_uuid: '',
      summary_fields: { job: { id: 1 } },
    } as unknown as JobEvent;

    const stableReloadJob = vi.fn();
    const stableSetFollow = vi.fn();
    const swrConfig = { provider: () => new Map() };

    vi.mocked(useJobOutput).mockReturnValue({
      jobEventCount: 1,
      getJobOutputEvent: vi.fn(),
      queryJobOutputEvent: vi.fn(),
      jobEvents: { 1: event1 },
    });

    const { rerender } = render(
      <SWRConfig value={swrConfig}>
        <JobOutputEvents
          job={jobFixture}
          reloadJob={stableReloadJob}
          toolbarFilters={[]}
          filterState={{}}
          isFollowModeEnabled={false}
          setIsFollowModeEnabled={stableSetFollow}
        />
      </SWRConfig>
    );

    expect(jobEventToRowsSpy.mock.calls.length).toBeGreaterThanOrEqual(1);
    jobEventToRowsSpy.mockClear();

    const newFilterState = { search: ['test'] };

    vi.mocked(useJobOutput).mockReturnValue({
      jobEventCount: 1,
      getJobOutputEvent: vi.fn(),
      queryJobOutputEvent: vi.fn(),
      jobEvents: { 1: event1 },
    });

    rerender(
      <SWRConfig value={swrConfig}>
        <JobOutputEvents
          job={jobFixture}
          reloadJob={stableReloadJob}
          toolbarFilters={[]}
          filterState={newFilterState}
          isFollowModeEnabled={false}
          setIsFollowModeEnabled={stableSetFollow}
        />
      </SWRConfig>
    );

    const callsForEvent1 = jobEventToRowsSpy.mock.calls.filter((args) => args[0]?.counter === 1);
    expect(callsForEvent1.length).toBe(1);

    jobEventToRowsSpy.mockRestore();
  });
});
