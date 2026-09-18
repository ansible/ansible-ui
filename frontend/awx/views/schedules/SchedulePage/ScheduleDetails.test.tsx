import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import { ScheduleDetails } from './ScheduleDetails';

const mockSchedule = {
  id: 1,
  name: 'Test Schedule',
  description: 'Test Description',
  rrule: 'DTSTART;TZID=America/New_York:20230509T105705 RRULE:FREQ=DAILY;INTERVAL=1;COUNT=1',
  dtstart: '2023-05-09T14:57:05Z',
  dtend: null,
  next_run: '2023-05-16T14:57:05Z',
  timezone: 'America/New_York',
  enabled: true,
  created: '2023-05-08T14:57:05.224768Z',
  modified: '2023-05-15T15:41:29.376525Z',
  scm_branch: 'feature/test-branch',
  job_type: 'run',
  job_tags: 'deploy,test',
  skip_tags: 'debug',
  limit: 'web_servers',
  forks: 5,
  job_slice_count: 1,
  timeout: 3600,
  verbosity: 1,
  diff_mode: true,
  extra_data: {},
  summary_fields: {
    unified_job_template: {
      id: 1,
      name: 'Test Job Template',
      description: 'Test Description',
      unified_job_type: 'job',
      job_type: 'run',
    },
    user_capabilities: { edit: true, delete: true },
    created_by: { id: 1, username: 'admin', first_name: '', last_name: '' },
    modified_by: { id: 1, username: 'admin', first_name: '', last_name: '' },
    inventory: { id: 1, name: 'Test Inventory' },
    execution_environment: { id: 1, name: 'Test EE', image: 'test:latest', description: '' },
  },
  related: {
    unified_job_template: '/api/v2/job_templates/1/',
  },
};

const server = setupServer(
  http.get(awxAPI`/schedules/1/`, () => {
    return HttpResponse.json(mockSchedule);
  }),
  http.get(awxAPI`/schedules/1/credentials/`, () => {
    return HttpResponse.json({
      count: 0,
      results: [],
    });
  }),
  http.get(awxAPI`/schedules/1/labels/`, () => {
    return HttpResponse.json({
      count: 1,
      results: [{ id: 1, name: 'schedule-label' }],
    });
  }),
  http.get(awxAPI`/job_templates/1/`, () => {
    return HttpResponse.json({
      id: 1,
      name: 'Test Job Template',
      description: 'Test Description',
      unified_job_type: 'job',
      job_type: 'run',
    });
  }),
  http.post(awxAPI`/schedules/preview/`, () => {
    return HttpResponse.json({
      local: ['2023-05-09T10:57:05-04:00'],
      utc: ['2023-05-09T14:57:05Z'],
    });
  })
);

describe('ScheduleDetails', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('renders schedule details with all expected fields', async () => {
    render(
      <MemoryRouter initialEntries={['/templates/1/schedules/1']}>
        <Routes>
          <Route path="/templates/:id/schedules/:schedule_id" element={<ScheduleDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('schedule-label')).toBeInTheDocument();
    });

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Test Schedule')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Time zone')).toBeInTheDocument();
    expect(screen.getByText('Labels')).toBeInTheDocument();
    expect(screen.getByText('schedule-label')).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getAllByRole('button', { name: 'admin' })[1]);
  });

  it('renders an empty labels detail when the schedule has no labels', async () => {
    server.use(
      http.get(awxAPI`/schedules/1/labels/`, () => HttpResponse.json({ count: 0, results: [] }))
    );

    render(
      <MemoryRouter initialEntries={['/templates/1/schedules/1']}>
        <Routes>
          <Route path="/templates/:id/schedules/:schedule_id" element={<ScheduleDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument();
    });

    expect(screen.queryByText('Labels')).not.toBeInTheDocument();
    expect(screen.queryByText('schedule-label')).not.toBeInTheDocument();
  });

  it('renders source control branch when scm_branch is set', async () => {
    render(
      <MemoryRouter initialEntries={['/templates/1/schedules/1']}>
        <Routes>
          <Route path="/templates/:id/schedules/:schedule_id" element={<ScheduleDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Source control branch')).toBeInTheDocument();
    });

    expect(screen.getByText('feature/test-branch')).toBeInTheDocument();
  });

  it('renders job type field', async () => {
    render(
      <MemoryRouter initialEntries={['/templates/1/schedules/1']}>
        <Routes>
          <Route path="/templates/:id/schedules/:schedule_id" element={<ScheduleDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Job type')).toBeInTheDocument();
    });
  });

  it('renders inventory field from summary_fields', async () => {
    render(
      <MemoryRouter initialEntries={['/templates/1/schedules/1']}>
        <Routes>
          <Route path="/templates/:id/schedules/:schedule_id" element={<ScheduleDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Inventory')).toBeInTheDocument();
    });

    expect(screen.getByText('Test Inventory')).toBeInTheDocument();
  });

  it('renders execution environment field', async () => {
    render(
      <MemoryRouter initialEntries={['/templates/1/schedules/1']}>
        <Routes>
          <Route path="/templates/:id/schedules/:schedule_id" element={<ScheduleDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Execution Envionment')).toBeInTheDocument();
    });

    expect(screen.getByText('Test EE')).toBeInTheDocument();
  });

  it('renders limit field', async () => {
    render(
      <MemoryRouter initialEntries={['/templates/1/schedules/1']}>
        <Routes>
          <Route path="/templates/:id/schedules/:schedule_id" element={<ScheduleDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Limit')).toBeInTheDocument();
    });

    expect(screen.getByText('web_servers')).toBeInTheDocument();
  });

  it('renders optional schedule details and workflow template branch', async () => {
    server.use(
      http.get(awxAPI`/schedules/1/`, () =>
        HttpResponse.json({
          ...mockSchedule,
          dtend: '2023-05-17T14:57:05Z',
          next_run: null,
          scm_branch: null,
          diff_mode: false,
          job_tags: [{ name: 'deploy' }],
          skip_tags: [{ name: 'debug' }],
          extra_data: { days: 14 },
          summary_fields: {
            ...mockSchedule.summary_fields,
            unified_job_template: { id: 2, unified_job_type: 'workflow_job' },
          },
          rrule:
            'DTSTART;TZID=America/New_York:20230509T105705 RRULE:FREQ=DAILY;COUNT=1 EXRULE:FREQ=WEEKLY;COUNT=1',
        })
      ),
      http.get(awxAPI`/workflow_job_templates/2/`, () =>
        HttpResponse.json({ scm_branch: 'workflow-branch' })
      ),
      http.get(awxAPI`/schedules/1/credentials/`, () =>
        HttpResponse.json({
          count: 1,
          results: [{ id: 3, name: 'SSH credential', kind: 'ssh' }],
        })
      )
    );

    render(
      <MemoryRouter initialEntries={['/templates/1/schedules/1']}>
        <Routes>
          <Route
            path="/templates/:id/schedules/:schedule_id"
            element={<ScheduleDetails isSystemJobTemplateSchedule />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Days of data to keep')).toBeInTheDocument();
    });

    expect(screen.getByText('workflow-branch')).toBeInTheDocument();
    expect(screen.getByText('SSH credential')).toBeInTheDocument();
    expect(screen.getByText('deploy')).toBeInTheDocument();
    expect(screen.getByText('debug')).toBeInTheDocument();
    expect(screen.getByText('Last run')).toBeInTheDocument();
    expect(screen.getByText('Exrule')).toBeInTheDocument();
    expect(screen.getByText('Off')).toBeInTheDocument();
    expect(screen.queryByText('Created')).not.toBeInTheDocument();
  });

  it('renders string retention data without fetching an unrelated template', async () => {
    server.use(
      http.get(awxAPI`/schedules/1/`, () =>
        HttpResponse.json({
          ...mockSchedule,
          extra_data: '{"days": 7}',
          summary_fields: {
            ...mockSchedule.summary_fields,
            unified_job_template: { id: 2, unified_job_type: 'project' },
          },
        })
      )
    );

    render(
      <MemoryRouter initialEntries={['/templates/1/schedules/1']}>
        <Routes>
          <Route path="/templates/:id/schedules/:schedule_id" element={<ScheduleDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Days of data to keep')).toBeInTheDocument();
    });
  });

  it('renders the loading state and API error state', async () => {
    server.use(
      http.get(awxAPI`/schedules/1/`, async () => {
        await new Promise((resolve) => setTimeout(resolve, 20));
        return HttpResponse.json({}, { status: 500 });
      })
    );

    render(
      <MemoryRouter initialEntries={['/templates/1/schedules/1']}>
        <Routes>
          <Route path="/templates/:id/schedules/:schedule_id" element={<ScheduleDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
    });
  });
});
