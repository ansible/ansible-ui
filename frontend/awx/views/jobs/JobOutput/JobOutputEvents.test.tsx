import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { SWRConfig } from 'swr';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { testFixture as jobFixture } from '../jobDetails.fixture';
import { JobOutputEvents } from './JobOutputEvents';

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
});
