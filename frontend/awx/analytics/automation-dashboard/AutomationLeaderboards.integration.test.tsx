import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { SWRConfig } from 'swr';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { PageDashboardContext } from '@ansible/ansible-ui-framework';
import { metricsAPI } from '../../common/api/metrics-utils';
import { AwxActiveUserContext } from '../../common/useAwxActiveUser';
import type { AwxUser } from '../../interfaces/User';
import { AutomationLeaderboards } from './AutomationLeaderboards';
import type { IAutomationDashboardCollectionStatus } from './types';
import { readAcknowledgedAchievements } from './utils/persistedAchievementState';
import { MOCK_LEADERBOARD_REPORT } from './views/useAutomationLeaderboardsView.fixtures';

/**
 * Wiring check for the new-achievement alert with nothing mocked but the network: the real view
 * hook maps the leaderboard payload, the real alert hook compares it against localStorage, and the
 * page renders the result. The per-case behaviour lives in `useNewAchievementsAlert.test.ts`.
 */

const USER_ID = 42;
const ALERT_TITLE = 'Congratulations! You or your organization earned new achievements.';

const collectionStatus: IAutomationDashboardCollectionStatus = {
  enabled: true,
  last_sync: '2026-09-01T14:00:00.000Z',
  show_dashboard: true,
  show_leaderboard: true,
};

const server = setupServer(
  http.get(metricsAPI`/dashboard_reports/leaderboard/`, () =>
    HttpResponse.json(MOCK_LEADERBOARD_REPORT)
  ),
  http.get(metricsAPI`/dashboard_reports/collection_status/`, () =>
    HttpResponse.json(collectionStatus)
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => localStorage.clear());
afterAll(() => server.close());

// Static, so defined once instead of as new objects on every render. `provider` still gives each
// mount its own empty cache.
const swrConfig = { dedupingInterval: 0, provider: () => new Map(), shouldRetryOnError: false };
const activeUserState = { activeAwxUser: { id: USER_ID } as AwxUser };
const dashboardContext = { columns: 24 };

function Providers({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <SWRConfig value={swrConfig}>
      <AwxActiveUserContext.Provider value={activeUserState}>
        <MemoryRouter>
          <PageDashboardContext.Provider value={dashboardContext}>
            {children}
          </PageDashboardContext.Provider>
        </MemoryRouter>
      </AwxActiveUserContext.Provider>
    </SWRConfig>
  );
}

describe('AutomationLeaderboards new-achievement alert (integration)', () => {
  // Renders the full card tree twice, so it needs well over the 5s default under load.
  test('should show the alert for earned achievements, persist the dismiss, and stay hidden on the next visit', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<AutomationLeaderboards />, { wrapper: Providers });

    expect(await screen.findByText(ALERT_TITLE)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /close/i }));

    await waitFor(() => expect(screen.queryByText(ALERT_TITLE)).not.toBeInTheDocument());
    // Every achievement the fixture earns, user and org, is acknowledged for this user (the hook
    // stores them sorted).
    expect(readAcknowledgedAchievements(USER_ID)).toEqual([
      'org:rising',
      'org:sustained',
      'user:centurion',
      'user:explorer',
      'user:ignition',
      'user:weekWarrior',
    ]);

    unmount();
    render(<AutomationLeaderboards />, { wrapper: Providers });

    expect(await screen.findByText(/Updated: .+/)).toBeInTheDocument();
    expect(screen.queryByText(ALERT_TITLE)).not.toBeInTheDocument();
  }, 30000);
});
