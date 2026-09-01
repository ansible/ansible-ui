import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import { ScheduleEditWizard } from './ScheduleEditWizard';

const zones = {
  zones: [
    'America/Argentina/Buenos_Aires',
    'America/Argentina/Catamarca',
    'Etc/GMT+0',
    'Etc/GMT+2',
    'WET',
    'Zulu',
  ],
  links: {},
};

const mockSchedule = {
  rrule:
    'DTSTART;TZID=America/Los_Angeles:20240411T104500 RRULE:INTERVAL=1;FREQ=HOURLY RRULE:INTERVAL=1;FREQ=DAILY;COUNT=225',
  id: 1,
  type: 'schedule',
  summary_fields: {
    unified_job_template: {
      id: 100,
      name: 'Mock Job Template',
      unified_job_type: 'job',
    },
    user_capabilities: { edit: true, delete: true },
  },
  name: 'Test Schedule',
  description: 'Automatically Generated Schedule',
  extra_data: { days: '120' },
  unified_job_template: 100,
  enabled: true,
  dtstart: '2024-04-14T15:50:01Z',
  next_run: '2024-04-14T15:50:01Z',
  timezone: 'America/Los_Angeles',
  related: { unified_job_template: '/api/v2/job_templates/100/' },
};

const server = setupServer(
  http.get(awxAPI`/schedules/zoneinfo/`, () => HttpResponse.json(zones)),
  http.get(awxAPI`/schedules/1/`, () => HttpResponse.json(mockSchedule)),
  http.get(awxAPI`/job_templates/100/`, () =>
    HttpResponse.json({ id: 100, name: 'Mock Job Template', type: 'job_template' })
  ),
  http.get(awxAPI`/job_templates/100/launch/`, () =>
    HttpResponse.json({
      ask_credential_on_launch: false,
      survey_enabled: false,
      defaults: { credentials: [], job_tags: '', skip_tags: '' },
    })
  ),
  http.post(awxAPI`/schedules/preview/`, () =>
    HttpResponse.json({
      local: ['2024-04-11T10:45:00-07:00'],
      utc: ['2024-04-11T17:45:00Z'],
    })
  )
);

function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter initialEntries={['/templates/job-template/100/schedules/1/edit']}>
      <Routes>
        <Route path="/templates/job-template/:id/schedules/:schedule_id/edit" element={children} />
      </Routes>
    </MemoryRouter>
  );
}

async function renderEditWizard() {
  const user = userEvent.setup();
  render(
    <TestWrapper>
      <ScheduleEditWizard resourceEndPoint={awxAPI`/job_templates/`} />
    </TestWrapper>
  );
  await waitFor(() => {
    expect(screen.getByTestId('page-title')).toHaveTextContent('Edit Test Schedule');
  });
  // PageWizard sets activeStep in an effect, so the Next footer is not on first paint.
  await screen.findByRole('button', { name: /^Next$/ });
  return user;
}

async function goToRulesStep(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole('button', { name: /^Next$/ }));
  await waitFor(() => {
    expect(screen.getByText('Schedule Rules')).toBeInTheDocument();
  });
}

describe('ScheduleEditWizard', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should render wizard with correct steps on initial load', async () => {
    await renderEditWizard();

    const nav = screen.getByTestId('wizard-nav');
    expect(nav).toBeInTheDocument();
    expect(screen.getByTestId('wizard-nav-item-details')).toBeInTheDocument();
    expect(screen.getByTestId('wizard-nav-item-rules')).toBeInTheDocument();
    expect(screen.getByTestId('wizard-nav-item-exceptions')).toBeInTheDocument();
    expect(screen.getByTestId('wizard-nav-item-review')).toBeInTheDocument();
  });

  it('should render schedule name in title', async () => {
    await renderEditWizard();

    expect(screen.getByTestId('page-title')).toBeInTheDocument();
  });

  it('should display rules when navigating to Rules step', async () => {
    const user = await renderEditWizard();
    await goToRulesStep(user);

    expect(screen.getByTestId('row-id-1')).toBeInTheDocument();
    expect(screen.getByTestId('row-id-2')).toBeInTheDocument();
  });

  it('should show Add rule button on Rules step', async () => {
    const user = await renderEditWizard();
    await goToRulesStep(user);

    expect(screen.getByRole('button', { name: /add rule/i })).toBeInTheDocument();
  });

  it('should have actions column with edit and delete for each rule row', async () => {
    const user = await renderEditWizard();
    await goToRulesStep(user);

    await waitFor(() => {
      expect(screen.getByTestId('row-id-1')).toBeInTheDocument();
    });

    const row1 = screen.getByTestId('row-id-1');
    const actionsCell = row1.querySelector('[data-testid="actions-column-cell"]');
    expect(actionsCell).toBeInTheDocument();
    const kebabButton = actionsCell?.querySelector('button');
    expect(kebabButton).toBeInTheDocument();
  });

  it('should render rule rows with RRule column', async () => {
    const user = await renderEditWizard();
    await goToRulesStep(user);

    expect(screen.getByText('RRule')).toBeInTheDocument();
    expect(screen.getByTestId('row-id-1')).toBeInTheDocument();
    expect(screen.getByTestId('row-id-2')).toBeInTheDocument();
  });

  it('should add new rule when clicking Add rule and Save rule', async () => {
    const user = await renderEditWizard();
    await goToRulesStep(user);

    await waitFor(() => {
      expect(screen.getByTestId('row-id-1')).toBeInTheDocument();
    });

    const initialRowCount = screen
      .getAllByRole('row')
      .filter((r) => r.dataset.testid?.startsWith('row-id-')).length;

    await user.click(screen.getByRole('button', { name: /add rule/i }));

    const saveButton = await screen.findByTestId('add-rule-button');
    await user.click(saveButton);

    await waitFor(() => {
      const rows = screen
        .getAllByRole('row')
        .filter((r) => r.dataset.testid?.startsWith('row-id-'));
      expect(rows.length).toBeGreaterThan(initialRowCount);
    });
  });
});
