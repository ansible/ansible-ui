import { PageWizard } from '@ansible/ansible-ui-framework';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SWRConfig } from 'swr';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import { useScheduleSteps } from '../hooks/useScheduleSteps';
import { ScheduleFormWizard } from '../types';

// ponytail: Vitest resolves router entrypoints separately; share the real DOM router context until test aliases unify them.
vi.mock('react-router', async () => vi.importActual('react-router-dom'));

const templateLabel = { id: 1, name: 'Template default', organization: 7 };
const scheduleLabel = { id: 2, name: 'Schedule label', organization: 7 };
const resource = {
  id: 123,
  type: 'job_template',
  name: 'Template',
  organization: 7,
  summary_fields: {},
};
const server = setupServer(
  http.get(awxAPI`/job_templates/123/`, () => HttpResponse.json(resource)),
  http.get(awxAPI`/job_templates/123/launch/`, () =>
    HttpResponse.json({
      ask_labels_on_launch: false,
      defaults: { labels: [templateLabel], job_tags: '', skip_tags: '', extra_vars: '{}' },
    })
  ),
  http.get(awxAPI`/schedules/789/`, () =>
    HttpResponse.json({ id: 789, extra_data: {}, summary_fields: {} })
  ),
  http.get(awxAPI`/schedules/789/labels/`, () =>
    HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  ),
  http.get(awxAPI`/labels/`, () =>
    HttpResponse.json({
      count: 2,
      results: [templateLabel, scheduleLabel],
      next: null,
      previous: null,
    })
  ),
  http.get(awxAPI`/schedules/zoneinfo/`, () => HttpResponse.json({ zones: ['UTC'], links: {} })),
  http.get(awxAPI`/job_templates/123/survey_spec/`, () => HttpResponse.json({ spec: [] })),
  http.post(awxAPI`/schedules/preview/`, () =>
    HttpResponse.json({ utc: ['2030-01-01T12:00:00Z'], local: ['2030-01-01T12:00:00'] })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());

function TestWizard(props: Readonly<{ onSubmit: (data: ScheduleFormWizard) => Promise<void> }>) {
  const getSteps = useScheduleSteps();
  return (
    <PageWizard<ScheduleFormWizard>
      steps={getSteps().filter((step) => ['details', 'promptStep', 'review'].includes(step.id))}
      stepDefaults={{
        details: {
          name: 'Schedule',
          schedule_type: 'job_template',
          resourceId: 123,
          startDateTime: { date: '2030-01-01', time: '12:00:00' },
          timezone: 'UTC',
          rules: [{ id: 1, rule: 'DTSTART:20300101T120000Z\nRRULE:FREQ=DAILY;INTERVAL=1' }],
          exceptions: [],
        },
      }}
      onSubmit={props.onSubmit}
    />
  );
}

function renderWizard(askLabels: boolean, edit = false) {
  server.use(
    http.get(awxAPI`/job_templates/123/launch/`, () =>
      HttpResponse.json({
        ask_labels_on_launch: askLabels,
        // Keep Prompts visible to exercise its supplemental merge even when labels live in Details.
        ask_limit_on_launch: true,
        defaults: {
          labels: [templateLabel],
          limit: '',
          job_tags: '',
          skip_tags: '',
          extra_vars: '{}',
        },
      })
    )
  );
  const onSubmit = vi.fn<(data: ScheduleFormWizard) => Promise<void>>().mockResolvedValue();
  render(
    <SWRConfig value={{ provider: () => new Map(), shouldRetryOnError: false }}>
      <MemoryRouter initialEntries={[edit ? '/schedules/789' : '/schedules/add']}>
        <Routes>
          <Route
            path={edit ? '/schedules/:schedule_id' : '/schedules/add'}
            element={<TestWizard onSubmit={onSubmit} />}
          />
        </Routes>
      </MemoryRouter>
    </SWRConfig>
  );
  return { user: userEvent.setup(), onSubmit };
}

async function openLabels(user: ReturnType<typeof userEvent.setup>, askLabels: boolean) {
  if (askLabels) {
    await waitFor(() => expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled());
    // The visible Prompts navigation entry indicates that initialization has finished.
    await screen.findByRole('button', { name: /Prompts/ });
    expect(screen.queryByPlaceholderText('Select or create labels')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Next' }));
  }
  const input = await screen.findByPlaceholderText('Select or create labels');
  await waitFor(() => expect(input).toBeEnabled());
  expect(screen.getAllByPlaceholderText('Select or create labels')).toHaveLength(1);
  return input;
}

async function goToReview(user: ReturnType<typeof userEvent.setup>, askLabels: boolean) {
  await user.click(screen.getByRole('button', { name: 'Next' }));
  if (!askLabels) {
    await screen.findByRole('textbox', { name: 'Limit' });
    expect(screen.queryByPlaceholderText('Select or create labels')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Next' }));
  }
  await screen.findByRole('button', { name: 'Finish' });
  await screen.findByRole('link', { name: 'Template' });
}

async function backToLabels(user: ReturnType<typeof userEvent.setup>, askLabels: boolean) {
  await user.click(screen.getByRole('button', { name: 'Back' }));
  if (!askLabels) await user.click(screen.getByRole('button', { name: 'Back' }));
  await screen.findByPlaceholderText('Select or create labels');
}

describe.each([false, true])('canonical schedule labels (ask_labels_on_launch=%s)', (askLabels) => {
  it('starts creation empty and preserves selected identities through Review, Back and submission', async () => {
    const { user, onSubmit } = renderWizard(askLabels);
    const input = await openLabels(user, askLabels);
    expect(
      screen.queryByRole('button', { name: 'Close Template default' })
    ).not.toBeInTheDocument();

    await user.type(input, 'Schedule label');
    await user.click(await screen.findByRole('option', { name: 'Schedule label' }));
    await user.type(input, 'Global label');
    await user.keyboard('{Enter}');
    await goToReview(user, askLabels);
    expect(screen.getByText('Schedule label', { exact: true })).toBeVisible();
    expect(screen.getByText('Global label', { exact: true })).toBeVisible();
    expect(screen.queryByText('Template default', { exact: true })).not.toBeInTheDocument();

    await backToLabels(user, askLabels);
    expect(screen.getByRole('button', { name: 'Close Schedule label' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Close Global label' })).toBeVisible();
    await goToReview(user, askLabels);
    await user.click(screen.getByRole('button', { name: 'Finish' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onSubmit.mock.calls[0][0].prompt.labels).toEqual([
      scheduleLabel,
      { name: 'Global label', organization: 7 },
    ]);
  }, 30000);

  it('keeps an empty edit relationship explicit rather than inheriting template defaults', async () => {
    const { user, onSubmit } = renderWizard(askLabels, true);
    await openLabels(user, askLabels);
    expect(
      screen.queryByRole('button', { name: 'Close Template default' })
    ).not.toBeInTheDocument();
    await goToReview(user, askLabels);
    expect(screen.queryByText('Template default', { exact: true })).not.toBeInTheDocument();
    await backToLabels(user, askLabels);
    expect(
      screen.queryByRole('button', { name: 'Close Template default' })
    ).not.toBeInTheDocument();
    await goToReview(user, askLabels);
    await user.click(screen.getByRole('button', { name: 'Finish' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onSubmit.mock.calls[0][0].prompt.labels).toEqual([]);
  }, 30000);

  it('preserves clearing edit labels through Review and remounting Details or Prompts', async () => {
    server.use(
      http.get(awxAPI`/schedules/789/labels/`, () =>
        HttpResponse.json({ count: 1, results: [scheduleLabel], next: null, previous: null })
      )
    );
    const { user, onSubmit } = renderWizard(askLabels, true);
    await openLabels(user, askLabels);
    expect(await screen.findByText('Schedule label', { exact: true })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Close label group' }));
    await goToReview(user, askLabels);
    expect(screen.queryByText('Schedule label', { exact: true })).not.toBeInTheDocument();
    await backToLabels(user, askLabels);
    expect(screen.queryByRole('button', { name: 'Close Schedule label' })).not.toBeInTheDocument();
    await goToReview(user, askLabels);
    await user.click(screen.getByRole('button', { name: 'Finish' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onSubmit.mock.calls[0][0].prompt.labels).toEqual([]);
  }, 30000);
});
