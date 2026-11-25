import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { JobEvent } from '../../../interfaces/JobEvent';
import { testFixture as jobFixture } from '../jobDetails.fixture';
import { JobOutputEvents } from './JobOutputEvents';
import * as JobOutputRowModule from './JobOutputRow';
import { useJobOutput } from './useJobOutput';

vi.mock('@ansible/ansible-ui-framework/hooks/useResizeObserver', () => ({
  useResizeObserver: vi.fn(),
}));

vi.mock('./HostEventModal', () => ({
  HostEventModal: ({ hostEvent }: { hostEvent: { counter: number } }) => (
    <div role="dialog">Host event {hostEvent.counter}</div>
  ),
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
    <JobOutputEvents
      job={job}
      reloadJob={vi.fn()}
      toolbarFilters={[]}
      filterState={{}}
      isFollowModeEnabled={false}
      setIsFollowModeEnabled={vi.fn()}
    />
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
      <JobOutputEvents
        job={completedJob}
        reloadJob={vi.fn()}
        toolbarFilters={[]}
        filterState={{}}
        isFollowModeEnabled={false}
        setIsFollowModeEnabled={vi.fn()}
      />
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
    vi.mocked(useJobOutput).mockReturnValue({
      jobEventCount: 1,
      getJobOutputEvent: vi.fn(),
      queryJobOutputEvent: vi.fn(),
      jobEvents,
    });

    const { rerender } = render(
      <JobOutputEvents
        job={jobFixture}
        reloadJob={stableReloadJob}
        toolbarFilters={[]}
        filterState={stableFilterState}
        isFollowModeEnabled={false}
        setIsFollowModeEnabled={stableSetFollow}
      />
    );

    const firstCallCount = jobEventToRowsSpy.mock.calls.length;
    expect(firstCallCount).toBe(1);

    vi.mocked(useJobOutput).mockReturnValue({
      jobEventCount: 1,
      getJobOutputEvent: vi.fn(),
      queryJobOutputEvent: vi.fn(),
      jobEvents: { ...jobEvents },
    });

    rerender(
      <JobOutputEvents
        job={jobFixture}
        reloadJob={stableReloadJob}
        toolbarFilters={[]}
        filterState={stableFilterState}
        isFollowModeEnabled={false}
        setIsFollowModeEnabled={stableSetFollow}
      />
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
    vi.mocked(useJobOutput).mockReturnValue({
      jobEventCount: 1,
      getJobOutputEvent: vi.fn(),
      queryJobOutputEvent: vi.fn(),
      jobEvents: { 1: event1 },
    });

    const { rerender } = render(
      <JobOutputEvents
        job={jobFixture}
        reloadJob={stableReloadJob}
        toolbarFilters={[]}
        filterState={stableFilterState}
        isFollowModeEnabled={false}
        setIsFollowModeEnabled={stableSetFollow}
      />
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
      <JobOutputEvents
        job={jobFixture}
        reloadJob={stableReloadJob}
        toolbarFilters={[]}
        filterState={stableFilterState}
        isFollowModeEnabled={false}
        setIsFollowModeEnabled={stableSetFollow}
      />
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
    vi.mocked(useJobOutput).mockReturnValue({
      jobEventCount: 1,
      getJobOutputEvent: vi.fn(),
      queryJobOutputEvent: vi.fn(),
      jobEvents: { 1: event1 },
    });

    const { rerender } = render(
      <JobOutputEvents
        job={jobFixture}
        reloadJob={stableReloadJob}
        toolbarFilters={[]}
        filterState={{}}
        isFollowModeEnabled={false}
        setIsFollowModeEnabled={stableSetFollow}
      />
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
      <JobOutputEvents
        job={jobFixture}
        reloadJob={stableReloadJob}
        toolbarFilters={[]}
        filterState={newFilterState}
        isFollowModeEnabled={false}
        setIsFollowModeEnabled={stableSetFollow}
      />
    );

    const callsForEvent1 = jobEventToRowsSpy.mock.calls.filter((args) => args[0]?.counter === 1);
    expect(callsForEvent1.length).toBe(1);

    jobEventToRowsSpy.mockRestore();
  });

  it('exposes scroll last navigation control', () => {
    renderJobOutput(jobFixture);

    expect(screen.getByRole('button', { name: 'Scroll last' })).toBeEnabled();
  });

  it('renders a traceback and skips loading rows that fill adjacent lines', () => {
    const queryJobOutputEvent = vi.fn();
    const playEvent = {
      counter: 1,
      stdout: 'PLAY [all]',
      uuid: 'play-1',
      parent_uuid: 'root',
      event: 'playbook_on_play_start',
      event_data: { play_uuid: 'play-1' },
      start_line: 0,
      created: '2024-01-01T00:00:00Z',
    } as unknown as JobEvent;
    const taskEvent = {
      counter: 3,
      stdout: 'TASK [debug]',
      uuid: 'task-1',
      parent_uuid: 'play-1',
      event: 'playbook_on_task_start',
      event_data: { play_uuid: 'play-1', task_uuid: 'task-1' },
      start_line: 1,
      created: '2024-01-01T00:00:01Z',
    } as unknown as JobEvent;

    vi.mocked(useJobOutput).mockReturnValue({
      jobEventCount: 3,
      getJobOutputEvent: vi.fn(),
      queryJobOutputEvent,
      jobEvents: { 1: playEvent, 3: taskEvent },
    });

    renderJobOutput({ ...jobFixture, result_traceback: 'Traceback (most recent call last)\nboom' });

    expect(screen.getByText(/Traceback \(most recent call last\)/)).toBeInTheDocument();
    expect(screen.getByText('boom')).toBeInTheDocument();
    expect(screen.getByText(/PLAY \[all\]/)).toBeInTheDocument();
    expect(queryJobOutputEvent).not.toHaveBeenCalled();
  });

  it('loads missing events and opens the host event dialog', async () => {
    const user = userEvent.setup();
    const hostEvent = {
      counter: 4,
      stdout: 'host output',
      uuid: 'host-row',
      event: 'runner_on_ok',
      host: 3,
      event_data: { res: { stdout: 'ok' }, play_uuid: 'play-1', task_uuid: 'task-9' },
      start_line: 10,
    } as unknown as JobEvent;
    const queryJobOutputEvent = vi.fn();
    vi.mocked(useJobOutput).mockReturnValue({
      jobEventCount: 4,
      getJobOutputEvent: (counter: number) =>
        counter === 4 ? hostEvent : ({ ...hostEvent, counter } as JobEvent),
      queryJobOutputEvent,
      jobEvents: { 4: hostEvent },
    });

    renderJobOutput(jobFixture);

    expect(document.querySelectorAll('.pf-v6-c-skeleton').length).toBeGreaterThan(0);
    expect(queryJobOutputEvent).toHaveBeenCalledWith(1);
    await user.click(screen.getByRole('button', { name: /host output/ }));
    expect(await screen.findByRole('dialog')).toHaveTextContent('Host event 4');
  });

  it('collapses play rows and hides child events', async () => {
    const user = userEvent.setup();
    const playEvent = {
      counter: 1,
      stdout: 'PLAY [all]',
      uuid: 'play-uuid',
      parent_uuid: 'root',
      event: 'playbook_on_play_start',
      event_data: { play_uuid: 'play-uuid' },
      start_line: 0,
      created: '2024-01-01T00:00:00Z',
    } as unknown as JobEvent;
    const childEvent = {
      counter: 2,
      stdout: 'child task line',
      uuid: 'child-uuid',
      parent_uuid: 'play-uuid',
      event: 'runner_on_ok',
      event_data: { play_uuid: 'play-uuid', task_uuid: 'task-uuid' },
      start_line: 1,
    } as unknown as JobEvent;

    vi.mocked(useJobOutput).mockReturnValue({
      jobEventCount: 2,
      getJobOutputEvent: vi.fn(),
      queryJobOutputEvent: vi.fn(),
      jobEvents: { 1: playEvent, 2: childEvent },
    });

    renderJobOutput(jobFixture);
    expect(screen.getByText('child task line')).toBeInTheDocument();

    await user.click(
      await screen.findByRole('button', { name: /expand job events|collapse all job events/i })
    );
    await waitFor(() => expect(screen.queryByText('child task line')).not.toBeInTheDocument());
  });

  it('hides the expand control for project updates and when the summary errors', async () => {
    server.use(http.get(childrenSummaryUrl, () => HttpResponse.json({}, { status: 500 })));
    renderJobOutput({ ...jobFixture, type: 'project_update' });

    await waitFor(() =>
      expect(
        screen.queryByRole('button', { name: /expand job events|collapse all job events/i })
      ).not.toBeInTheDocument()
    );
    expect(screen.getByRole('button', { name: 'Scroll first' })).toBeInTheDocument();
  });
});
