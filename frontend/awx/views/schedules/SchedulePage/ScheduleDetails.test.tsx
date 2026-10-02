import { render, screen, waitFor } from '@testing-library/react';
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

  it('renders schedule fields, schedule labels, credentials, and the schedule branch', async () => {
    renderPage();

    expect(await screen.findByText('Test Schedule')).toBeInTheDocument();
    expect(await screen.findByText('schedule-label')).toBeInTheDocument();
    expect(await screen.findByText('SSH credential')).toBeInTheDocument();
    expect(screen.getByText('Test Inventory')).toBeInTheDocument();
    expect(screen.getByText('feature/test-branch')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText('Test EE')).toBeInTheDocument();
    expect(screen.getByText('web_servers')).toBeInTheDocument();
    expect(screen.getByText('run', { exact: true })).toBeInTheDocument();
    expect(screen.queryByText('template-branch')).not.toBeInTheDocument();
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
    expect(screen.getByText('14', { exact: true })).toBeInTheDocument();
    expect(screen.getByText('Exrule')).toBeInTheDocument();
    expect(screen.getByText('Off')).toBeInTheDocument();
    expect(screen.queryByText('Created')).not.toBeInTheDocument();
  });

  it.each(['job', 'workflow_job'])('falls back to the %s template branch', async (jobType) => {
    server.use(
      http.get(awxAPI`/schedules/1/`, () =>
        HttpResponse.json({
          ...schedule,
          scm_branch: '',
          summary_fields: {
            ...schedule.summary_fields,
            unified_job_template: { id: 1, unified_job_type: jobType },
          },
        })
      ),
      http.get(awxAPI`/workflow_job_templates/1/`, () =>
        HttpResponse.json({ scm_branch: 'template-branch' })
      )
    );

    renderPage();

    expect(await screen.findByText('template-branch')).toBeInTheDocument();
    expect(screen.queryByText('feature/test-branch')).not.toBeInTheDocument();
  });

  it.each([
    {
      name: 'UTC UNTIL and an exception',
      dtstart: 'DTSTART;TZID=America/New_York:20230509T105705',
      rule: 'RRULE:FREQ=DAILY;UNTIL=20230517T145705Z',
      exception: 'EXRULE:FREQ=WEEKLY;BYDAY=SA',
    },
    { name: 'no DTSTART', dtstart: '', rule: 'RRULE:FREQ=DAILY;COUNT=1', exception: '' },
    {
      name: 'an exception without DTSTART',
      dtstart: '',
      rule: 'RRULE:FREQ=DAILY;COUNT=1',
      exception: 'EXRULE:FREQ=WEEKLY;BYDAY=SA',
    },
  ])('preserves preview payloads for $name', async ({ dtstart, rule, exception }) => {
    const rrule = [dtstart, rule, exception].filter(Boolean).join(' ');
    const previewBodies: unknown[] = [];
    server.use(
      http.get(awxAPI`/schedules/1/`, () => HttpResponse.json({ ...schedule, rrule })),
      http.post(awxAPI`/schedules/preview/`, async ({ request }) => {
        previewBodies.push(await request.json());
        return HttpResponse.json({ local: [], utc: [] });
      })
    );

    renderPage();

    expect(await screen.findByText('Test Schedule')).toBeInTheDocument();
    const expectedRules = [rrule, [dtstart, rule].filter(Boolean).join('\n')];
    if (exception) {
      expect(screen.getByText('Exrule')).toBeInTheDocument();
      expectedRules.push(
        [dtstart, exception.replace('EXRULE:', 'RRULE:')].filter(Boolean).join('\n')
      );
    } else {
      expect(screen.queryByText('Exrule')).not.toBeInTheDocument();
    }
    await waitFor(() =>
      expect(previewBodies).toEqual(
        expect.arrayContaining(expectedRules.map((rrule) => ({ rrule })))
      )
    );
  });

  it('renders schedules with no labels without using template labels', async () => {
    server.use(
      http.get(awxAPI`/schedules/1/labels/`, () =>
        HttpResponse.json({ count: 0, next: null, previous: null, results: [] })
      ),
      http.get(awxAPI`/job_templates/1/`, () =>
        HttpResponse.json({
          scm_branch: 'template-branch',
          labels: [{ id: 2, name: 'template-label' }],
        })
      )
    );

    renderPage();

    expect(await screen.findByText('Test Schedule')).toBeInTheDocument();
    expect(await screen.findByText('SSH credential')).toBeInTheDocument();
    expect(screen.queryByText('Labels', { exact: true })).not.toBeInTheDocument();
    expect(screen.queryByText('template-label')).not.toBeInTheDocument();
  });

  it('displays labels from every schedule-label API page', async () => {
    const pagesRequested: string[] = [];
    server.use(
      http.get(awxAPI`/schedules/1/labels/`, ({ request }) => {
        const page = new URL(request.url).searchParams.get('page') || '1';
        pagesRequested.push(page);
        return HttpResponse.json({
          count: 2,
          next: page === '1' ? awxAPI`/schedules/1/labels/?page=2` : null,
          previous: page === '2' ? awxAPI`/schedules/1/labels/` : null,
          results: [{ id: Number(page), name: `schedule-label-page-${page}` }],
        });
      })
    );

    renderPage();

    expect(await screen.findByText('schedule-label-page-1')).toBeInTheDocument();
    expect(await screen.findByText('schedule-label-page-2')).toBeInTheDocument();
    expect(pagesRequested).toEqual(['1', '2']);
  });

  it('keeps schedule details usable while labels are loading', async () => {
    let resolveLabels: (response: Response) => void = () => {};
    const labelResponse = new Promise<Response>((resolve) => {
      resolveLabels = resolve;
    });
    server.use(http.get(awxAPI`/schedules/1/labels/`, () => labelResponse));

    renderPage();

    try {
      expect(await screen.findByText('Test Schedule')).toBeInTheDocument();
      expect(screen.getByText('web_servers')).toBeInTheDocument();
      expect(screen.queryByText('schedule-label')).not.toBeInTheDocument();
    } finally {
      resolveLabels(HttpResponse.json({ count: 1, results: [{ id: 1, name: 'schedule-label' }] }));
    }
    expect(await screen.findByText('schedule-label')).toBeInTheDocument();
  });

  it.each([403, 500])(
    'keeps schedule details usable after a label GET returns %s',
    async (status) => {
      let labelRequestFailed = false;
      server.use(
        http.get(awxAPI`/schedules/1/labels/`, () => {
          labelRequestFailed = true;
          return HttpResponse.json({ detail: 'Labels unavailable' }, { status });
        })
      );

      renderPage();

      await waitFor(() => expect(labelRequestFailed).toBe(true));
      expect(await screen.findByText('Test Schedule')).toBeInTheDocument();
      expect(await screen.findByText('SSH credential')).toBeInTheDocument();
      expect(screen.getByText('Test Inventory')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Toggle to UTC' })).toBeEnabled();
      expect(screen.queryByRole('button', { name: 'Refresh' })).not.toBeInTheDocument();
    }
  );

  it('renders the schedule error state', async () => {
    server.use(http.get(awxAPI`/schedules/1/`, () => HttpResponse.json({}, { status: 500 })));

    renderPage();

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument()
    );
  });
});
