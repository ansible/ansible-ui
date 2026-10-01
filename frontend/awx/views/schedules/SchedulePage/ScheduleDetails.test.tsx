import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { SWRConfig } from 'swr';
import { awxAPI } from '../../../common/api/awx-utils';
import { ScheduleDetails } from './ScheduleDetails';

const schedule = {
  id: 1,
  name: 'Test Schedule',
  description: 'Test Description',
  rrule: 'DTSTART;TZID=America/New_York:20230509T105705 RRULE:FREQ=DAILY;COUNT=1',
  dtstart: '2023-05-09T14:57:05Z',
  dtend: null,
  next_run: '2023-05-16T14:57:05Z',
  timezone: 'America/New_York',
  enabled: true,
  created: '2023-05-08T14:57:05Z',
  modified: '2023-05-15T15:41:29Z',
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
    unified_job_template: { id: 1, unified_job_type: 'job' },
    created_by: { id: 1, username: 'admin' },
    modified_by: { id: 1, username: 'admin' },
    inventory: { id: 1, name: 'Test Inventory' },
    execution_environment: { id: 1, name: 'Test EE' },
  },
};

const server = setupServer(
  http.get(awxAPI`/schedules/1/`, () => HttpResponse.json(schedule)),
  http.get(awxAPI`/schedules/1/credentials/`, () =>
    HttpResponse.json({ count: 1, results: [{ id: 3, name: 'SSH credential', kind: 'ssh' }] })
  ),
  http.get(awxAPI`/schedules/1/labels/`, () =>
    HttpResponse.json({ count: 1, results: [{ id: 1, name: 'schedule-label' }] })
  ),
  http.get(awxAPI`/job_templates/1/`, () => HttpResponse.json({ scm_branch: 'template-branch' })),
  http.post(awxAPI`/schedules/preview/`, () => HttpResponse.json({ local: [], utc: [] }))
);

function renderPage(isSystemJobTemplateSchedule = false) {
  return render(
    <SWRConfig value={{ provider: () => new Map() }}>
      <MemoryRouter initialEntries={['/templates/1/schedules/1']}>
        <Routes>
          <Route
            path="/templates/:id/schedules/:schedule_id"
            element={<ScheduleDetails isSystemJobTemplateSchedule={isSystemJobTemplateSchedule} />}
          />
        </Routes>
      </MemoryRouter>
    </SWRConfig>
  );
}

describe('ScheduleDetails', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('renders schedule fields, labels, credentials, and template branch', async () => {
    renderPage();

    expect(await screen.findByText('Test Schedule')).toBeInTheDocument();
    expect(screen.getByText('schedule-label')).toBeInTheDocument();
    expect(screen.getByText('SSH credential')).toBeInTheDocument();
    expect(screen.getByText('Test Inventory')).toBeInTheDocument();
    expect(screen.getByText('feature/test-branch')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
    fireEvent.click(screen.getAllByText('admin')[1]);
  });

  it('renders exception rules and retention data without a DTSTART', async () => {
    server.use(
      http.get(awxAPI`/schedules/1/`, () =>
        HttpResponse.json({
          ...schedule,
          rrule: 'RRULE:FREQ=DAILY;COUNT=1 EXRULE:FREQ=WEEKLY;BYDAY=SA',
          extra_data: { days: 14 },
          dtend: '2023-05-17T14:57:05Z',
          next_run: null,
          diff_mode: false,
        })
      )
    );

    renderPage(true);

    expect(await screen.findByText('Days of data to keep')).toBeInTheDocument();
    expect(screen.getByText('Exrule')).toBeInTheDocument();
    expect(screen.getByText('Off')).toBeInTheDocument();
    expect(screen.queryByText('Created')).not.toBeInTheDocument();
  });

  it('renders the loading and error states', async () => {
    server.use(http.get(awxAPI`/schedules/1/`, () => HttpResponse.json({}, { status: 500 })));

    renderPage();

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument()
    );
  });
});
