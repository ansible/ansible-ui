import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SWRConfig } from 'swr';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { PlatformActiveUserContext } from '@ansible/platform-ui/main/PlatformActiveUserProvider';
import type { PlatformUser } from '@ansible/platform-ui/interfaces/PlatformUser';
import { metricsAPI } from '../../common/api/metrics-utils';
import { AutomationAnalyticsSettingsDetails } from './AutomationAnalyticsSettingsDetails';
import { useCollectionStatus } from './common/useCollectionStatus';
import type { IAutomationDashboardCollectionStatus } from './types';

const collectionStatusUrl = metricsAPI`/dashboard_reports/collection_status/`;

const collectionStatus: IAutomationDashboardCollectionStatus = {
  enabled: true,
  last_sync: '2026-09-21T07:08:09.000Z',
  show_dashboard: true,
  show_leaderboard: true,
};

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const superuser = { is_superuser: true, is_platform_auditor: false } as PlatformUser;
const platformAuditor = { is_superuser: false, is_platform_auditor: true } as PlatformUser;
const regularUser = { is_superuser: false, is_platform_auditor: false } as PlatformUser;

/** Stands in for the nav, which polls the same collection_status key in the background. */
function Poller() {
  const { error } = useCollectionStatus({ refreshInterval: 200 });
  return error ? <div>Poll failed</div> : null;
}

function renderDetails(activePlatformUser: PlatformUser = superuser, withPoller = false) {
  return render(
    <SWRConfig
      value={{ dedupingInterval: 0, provider: () => new Map(), shouldRetryOnError: false }}
    >
      {withPoller && <Poller />}
      <PlatformActiveUserContext.Provider value={{ activePlatformUser }}>
        <MemoryRouter initialEntries={['/settings/automation-analytics']}>
          <Routes>
            <Route path="/settings/automation-analytics">
              <Route path="edit" element={<div>Edit page</div>} />
              <Route index element={<AutomationAnalyticsSettingsDetails />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </PlatformActiveUserContext.Provider>
    </SWRConfig>
  );
}

describe('AutomationAnalyticsSettingsDetails', () => {
  test('should show the leaderboard as enabled when show_leaderboard is true', async () => {
    server.use(http.get(collectionStatusUrl, () => HttpResponse.json(collectionStatus)));

    renderDetails();

    expect(await screen.findByText('Automation Leaderboards')).toBeInTheDocument();
    expect(screen.getByText('Enabled')).toBeInTheDocument();
  });

  test('should show the leaderboard as disabled when show_leaderboard is false', async () => {
    server.use(
      http.get(collectionStatusUrl, () =>
        HttpResponse.json({ ...collectionStatus, show_leaderboard: false })
      )
    );

    renderDetails();

    expect(await screen.findByText('Disabled')).toBeInTheDocument();
    expect(screen.queryByText('Enabled')).not.toBeInTheDocument();
  });

  test('should navigate to the edit page when Edit is clicked', async () => {
    const user = userEvent.setup();
    server.use(http.get(collectionStatusUrl, () => HttpResponse.json(collectionStatus)));

    renderDetails();
    await user.click(
      await screen.findByRole('button', { name: 'Edit automation analytics settings' })
    );

    expect(await screen.findByText('Edit page')).toBeInTheDocument();
  });

  test('should show the Edit button for a platform auditor', async () => {
    server.use(http.get(collectionStatusUrl, () => HttpResponse.json(collectionStatus)));

    renderDetails(platformAuditor);

    expect(
      await screen.findByRole('button', { name: 'Edit automation analytics settings' })
    ).toBeInTheDocument();
  });

  test('should hide the Edit button for a user who is neither superuser nor platform auditor', async () => {
    server.use(http.get(collectionStatusUrl, () => HttpResponse.json(collectionStatus)));

    renderDetails(regularUser);

    expect(await screen.findByText('Enabled')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Edit automation analytics settings' })
    ).not.toBeInTheDocument();
  });

  test('should show the leaderboard help text in a popover', async () => {
    const user = userEvent.setup();
    server.use(http.get(collectionStatusUrl, () => HttpResponse.json(collectionStatus)));

    renderDetails();
    await screen.findByText('Enabled');
    await user.click(screen.getByRole('button', { name: '' }));

    expect(
      await screen.findByText(/Controls whether the Automation Leaderboard is visible/)
    ).toBeInTheDocument();
  });

  test('should keep showing the loaded value when a background poll fails', async () => {
    let getCount = 0;
    server.use(
      http.get(collectionStatusUrl, () => {
        getCount += 1;
        return getCount === 1
          ? HttpResponse.json(collectionStatus)
          : HttpResponse.json({ detail: 'blip' }, { status: 500 });
      })
    );

    renderDetails(superuser, true);
    expect(await screen.findByText('Enabled')).toBeInTheDocument();
    expect(await screen.findByText('Poll failed')).toBeInTheDocument();

    expect(screen.queryByText('Internal Server Error')).not.toBeInTheDocument();
    expect(screen.getByText('Enabled')).toBeInTheDocument();
  });

  test('should show an error when collection_status fails', async () => {
    server.use(
      http.get(collectionStatusUrl, () => HttpResponse.json({ detail: 'boom' }, { status: 500 }))
    );

    renderDetails();

    expect(await screen.findByText('Internal Server Error')).toBeInTheDocument();
    expect(screen.queryByText('Automation Leaderboards')).not.toBeInTheDocument();
  });
});
