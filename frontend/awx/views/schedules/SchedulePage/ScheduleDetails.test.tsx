import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { SWRConfig } from 'swr';
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
      expect(screen.getByText('Name')).toBeInTheDocument();
    });

    expect(screen.getByText('Test Schedule')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Time zone')).toBeInTheDocument();
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

  it('should preserve the Z suffix on UNTIL in per-rule preview calls', async () => {
    const rruleWithUntil =
      'DTSTART;TZID=America/New_York:20260812T170000 RRULE:FREQ=HOURLY;INTERVAL=1;UNTIL=20260813T000000Z;BYSECOND=0';
    const capturedBodies: string[] = [];

    server.use(
      http.post(awxAPI`/schedules/preview/`, async ({ request }) => {
        const body = (await request.json()) as { rrule: string };
        capturedBodies.push(body.rrule);
        return HttpResponse.json({ local: [], utc: [] });
      }),
      http.get(awxAPI`/schedules/1/`, () =>
        HttpResponse.json({
          ...mockSchedule,
          rrule: rruleWithUntil,
          timezone: 'America/New_York',
        })
      )
    );

    render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <MemoryRouter initialEntries={['/templates/1/schedules/1']}>
          <Routes>
            <Route path="/templates/:id/schedules/:schedule_id" element={<ScheduleDetails />} />
          </Routes>
        </MemoryRouter>
      </SWRConfig>
    );

    await waitFor(() => expect(capturedBodies.length).toBeGreaterThanOrEqual(2));

    const perRuleBody = capturedBodies.find((r) => r !== rruleWithUntil);
    expect(perRuleBody).toBeDefined();
    expect(perRuleBody).toContain('UNTIL=20260813T000000Z');
  });

  it('should render exceptions list when schedule has an EXRULE', async () => {
    server.use(
      http.get(awxAPI`/schedules/1/`, () =>
        HttpResponse.json({
          ...mockSchedule,
          rrule:
            'DTSTART;TZID=America/New_York:20230509T105705 RRULE:FREQ=DAILY;INTERVAL=1 EXRULE:FREQ=WEEKLY;BYDAY=SA',
        })
      )
    );

    render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <MemoryRouter initialEntries={['/templates/1/schedules/1']}>
          <Routes>
            <Route path="/templates/:id/schedules/:schedule_id" element={<ScheduleDetails />} />
          </Routes>
        </MemoryRouter>
      </SWRConfig>
    );

    expect(await screen.findByText('Exrule')).toBeInTheDocument();
  });

  it('should transform EXRULE to RRULE only in exception preview POST bodies', async () => {
    const rruleWithExrule =
      'DTSTART;TZID=America/New_York:20230509T105705 RRULE:FREQ=DAILY;INTERVAL=1 EXRULE:FREQ=WEEKLY;BYDAY=SA;UNTIL=20230513T000000Z';
    const capturedBodies: string[] = [];

    server.use(
      http.post(awxAPI`/schedules/preview/`, async ({ request }) => {
        const body = (await request.json()) as { rrule: string };
        capturedBodies.push(body.rrule);
        return HttpResponse.json({ local: [], utc: [] });
      }),
      http.get(awxAPI`/schedules/1/`, () =>
        HttpResponse.json({
          ...mockSchedule,
          rrule: rruleWithExrule,
          timezone: 'America/New_York',
        })
      )
    );

    render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <MemoryRouter initialEntries={['/templates/1/schedules/1']}>
          <Routes>
            <Route path="/templates/:id/schedules/:schedule_id" element={<ScheduleDetails />} />
          </Routes>
        </MemoryRouter>
      </SWRConfig>
    );

    await waitFor(() => {
      expect(capturedBodies).toContain(rruleWithExrule);
      expect(
        capturedBodies.find(
          (body) =>
            body !== rruleWithExrule && body.includes('FREQ=WEEKLY') && body.includes('BYDAY=SA')
        )
      ).toBeDefined();
    });

    const exceptionPreviewBody = capturedBodies.find(
      (body) =>
        body !== rruleWithExrule && body.includes('FREQ=WEEKLY') && body.includes('BYDAY=SA')
    );
    expect(exceptionPreviewBody).toBeDefined();
    expect(exceptionPreviewBody).not.toContain('EXRULE:');
    expect(exceptionPreviewBody).toContain('DTSTART;TZID=America/New_York:20230509T105705');
    expect(exceptionPreviewBody).toContain('RRULE:FREQ=WEEKLY;BYDAY=SA;UNTIL=20230513T000000Z');
  });

  it('should handle schedule rrule with no DTSTART', async () => {
    const rruleNoDtstart = 'RRULE:FREQ=DAILY;INTERVAL=1;COUNT=1';
    const capturedBodies: string[] = [];

    server.use(
      http.post(awxAPI`/schedules/preview/`, async ({ request }) => {
        const body = (await request.json()) as { rrule: string };
        capturedBodies.push(body.rrule);
        return HttpResponse.json({ local: [], utc: [] });
      }),
      http.get(awxAPI`/schedules/1/`, () =>
        HttpResponse.json({ ...mockSchedule, rrule: rruleNoDtstart })
      )
    );

    render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <MemoryRouter initialEntries={['/templates/1/schedules/1']}>
          <Routes>
            <Route path="/templates/:id/schedules/:schedule_id" element={<ScheduleDetails />} />
          </Routes>
        </MemoryRouter>
      </SWRConfig>
    );

    await waitFor(() => expect(capturedBodies.length).toBeGreaterThanOrEqual(1));
    expect(capturedBodies.every((b) => !b.startsWith('DTSTART'))).toBe(true);
    expect(capturedBodies.includes(rruleNoDtstart)).toBe(true);
  });

  it('should handle schedule exceptions with no DTSTART', async () => {
    const rruleWithExruleNoDtstart =
      'RRULE:FREQ=DAILY;INTERVAL=1;COUNT=1 EXRULE:FREQ=WEEKLY;BYDAY=SA';
    const capturedBodies: string[] = [];

    server.use(
      http.post(awxAPI`/schedules/preview/`, async ({ request }) => {
        const body = (await request.json()) as { rrule: string };
        capturedBodies.push(body.rrule);
        return HttpResponse.json({ local: [], utc: [] });
      }),
      http.get(awxAPI`/schedules/1/`, () =>
        HttpResponse.json({ ...mockSchedule, rrule: rruleWithExruleNoDtstart })
      )
    );

    render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <MemoryRouter initialEntries={['/templates/1/schedules/1']}>
          <Routes>
            <Route path="/templates/:id/schedules/:schedule_id" element={<ScheduleDetails />} />
          </Routes>
        </MemoryRouter>
      </SWRConfig>
    );

    expect(await screen.findByText('Exrule')).toBeInTheDocument();
    await waitFor(() => expect(capturedBodies).toContain('RRULE:FREQ=WEEKLY;BYDAY=SA'));
    expect(capturedBodies.every((b) => !b.startsWith('DTSTART'))).toBe(true);
  });
});
