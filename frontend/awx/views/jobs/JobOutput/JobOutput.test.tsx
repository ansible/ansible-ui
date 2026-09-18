import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { ToolbarFilterType } from '@ansible/ansible-ui-framework/PageToolbar/PageToolbarFilter';
import { awxAPI } from '../../../common/api/awx-utils';
import { testFixture as jobFixture } from '../jobDetails.fixture';
import { HostStatusBar } from './StatusBar';
import { JobOutputToolbar } from './JobOutputToolbar';
import { JobStatusBar } from './JobStatusBar';

const jobEventsOptionsFixture = {
  actions: {
    GET: {
      search: { type: 'string', label: 'Search', filterable: true },
      event: {
        type: 'choice',
        label: 'Event',
        filterable: true,
        choices: [
          ['runner_on_ok', 'Host OK'],
          ['runner_on_failed', 'Host Failed'],
          ['playbook_on_start', 'Playbook Started'],
        ],
      },
      stdout: { type: 'string', label: 'Stdout', filterable: true },
    },
  },
} as const;

const jobEventsFixture = {
  count: 2,
  next: null,
  previous: null,
  results: [
    {
      id: 1,
      counter: 1,
      event: 'playbook_on_start',
      event_display: 'Playbook Started',
      stdout: '',
      start_line: 0,
      end_line: 0,
      uuid: 'test-uuid-1',
      parent_uuid: '',
      failed: false,
      changed: false,
      host: null,
      host_name: '',
      job: 26,
    },
    {
      id: 2,
      counter: 2,
      event: 'playbook_on_stats',
      event_display: 'Playbook Complete',
      stdout: 'PLAY RECAP',
      start_line: 1,
      end_line: 2,
      uuid: 'test-uuid-2',
      parent_uuid: '',
      failed: false,
      changed: false,
      host: null,
      host_name: '',
      job: 26,
    },
  ],
};

const server = setupServer(
  http.get(awxAPI`/jobs/26/`, () => HttpResponse.json(jobFixture)),
  http.options(awxAPI`/jobs/26/job_events/`, () => HttpResponse.json(jobEventsOptionsFixture)),
  http.get('*/jobs/26/job_events/', () => HttpResponse.json(jobEventsFixture))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('JobOutput', () => {
  it('should render job output status bar with job details', async () => {
    render(
      <MemoryRouter>
        <JobStatusBar job={jobFixture} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Demo Job Template')).toBeInTheDocument();
    });

    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('Plays')).toBeInTheDocument();
  });

  it('should render host status bar with job host counts', () => {
    render(<HostStatusBar counts={jobFixture.host_status_counts || {}} />);

    expect(screen.getByTestId('status-bar')).toBeInTheDocument();
    expect(screen.getByText('Success 1')).toBeInTheDocument();
    expect(screen.queryByText('Success 100%')).not.toBeInTheDocument();
  });

  it('should render JobOutputToolbar with filter options', () => {
    const toolbarFilters = [
      {
        key: 'event',
        label: 'Event',
        type: ToolbarFilterType.MultiSelect as const,
        placeholder: 'Select event',
        query: 'event',
        options: [
          { value: 'runner_on_ok', label: 'Host OK' },
          { value: 'runner_on_failed', label: 'Host Failed' },
        ],
      },
    ];
    const filterState = {};
    const setFilterState = () => {};

    render(
      <JobOutputToolbar
        toolbarFilters={toolbarFilters}
        filterState={filterState}
        setFilterState={setFilterState}
        jobStatus="successful"
        isFollowModeEnabled={false}
        setIsFollowModeEnabled={() => {}}
      />
    );

    expect(screen.getByText('Event')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Show Filters' })).toBeInTheDocument();
  });

  it('should display filter options with filterable keys from job_events API', async () => {
    render(
      <MemoryRouter>
        <JobStatusBar job={jobFixture} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Demo Job Template')).toBeInTheDocument();
    });

    expect(screen.getByText('Plays')).toBeInTheDocument();
    expect(screen.getByText('Tasks')).toBeInTheDocument();
  });
});
