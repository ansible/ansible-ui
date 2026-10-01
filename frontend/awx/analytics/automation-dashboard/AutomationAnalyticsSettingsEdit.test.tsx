import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SWRConfig } from 'swr';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { metricsAPI } from '../../common/api/metrics-utils';
import { AutomationAnalyticsSettingsEdit } from './AutomationAnalyticsSettingsEdit';
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

const DETAILS_PAGE_TEXT = 'Details page';

/**
 * Renders the edit page with the details route behind it.
 * `backgroundConsumer` is mounted next to the router, like the nav that shares the SWR key.
 */
function renderEdit(backgroundConsumer?: ReactNode) {
  return render(
    <SWRConfig
      value={{ dedupingInterval: 0, provider: () => new Map(), shouldRetryOnError: false }}
    >
      {backgroundConsumer}
      <MemoryRouter initialEntries={['/settings/automation-analytics/edit']}>
        <Routes>
          <Route path="/settings/automation-analytics">
            <Route path="edit" element={<AutomationAnalyticsSettingsEdit />} />
            <Route index element={<div>{DETAILS_PAGE_TEXT}</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </SWRConfig>
  );
}

/** Stands in for the nav/leaderboard: a consumer that stays mounted across the save. */
function MountedConsumer() {
  const { data } = useCollectionStatus();
  if (!data) return <div>Consumer: no data</div>;
  return <div>{data.show_leaderboard ? 'Consumer: Enabled' : 'Consumer: Disabled'}</div>;
}

/** Stands in for the nav, which polls the same collection_status key in the background. */
function Poller() {
  const { error } = useCollectionStatus({ refreshInterval: 200 });
  return error ? <div>Poll failed</div> : null;
}

describe('AutomationAnalyticsSettingsEdit', () => {
  test('should prefill the select with Enabled when show_leaderboard is true', async () => {
    server.use(http.get(collectionStatusUrl, () => HttpResponse.json(collectionStatus)));

    renderEdit();

    expect(await screen.findByRole('button', { name: 'Enabled' })).toBeInTheDocument();
  });

  test('should prefill the select with Disabled when show_leaderboard is false', async () => {
    server.use(
      http.get(collectionStatusUrl, () =>
        HttpResponse.json({ ...collectionStatus, show_leaderboard: false })
      )
    );

    renderEdit();

    expect(await screen.findByRole('button', { name: 'Disabled' })).toBeInTheDocument();
  });

  test('should POST only show_leaderboard and return to details on save', async () => {
    const user = userEvent.setup();
    let postedBody: unknown;
    server.use(
      http.get(collectionStatusUrl, () => HttpResponse.json(collectionStatus)),
      http.post(collectionStatusUrl, async ({ request }) => {
        postedBody = await request.json();
        return HttpResponse.json({ ...collectionStatus, show_leaderboard: false });
      })
    );

    renderEdit();
    await user.click(await screen.findByRole('button', { name: 'Enabled' }));
    await user.click(await screen.findByRole('option', { name: 'Disabled' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText(DETAILS_PAGE_TEXT)).toBeInTheDocument();
    expect(postedBody).toEqual({ show_leaderboard: false });
  }, 15000);

  test('should refresh already mounted collection_status consumers after saving', async () => {
    const user = userEvent.setup();
    let serverStatus = collectionStatus;
    server.use(
      http.get(collectionStatusUrl, () => HttpResponse.json(serverStatus)),
      http.post(collectionStatusUrl, async ({ request }) => {
        const body = (await request.json()) as Pick<
          IAutomationDashboardCollectionStatus,
          'show_leaderboard'
        >;
        serverStatus = { ...serverStatus, ...body };
        return HttpResponse.json(serverStatus);
      })
    );

    renderEdit(<MountedConsumer />);
    expect(await screen.findByText('Consumer: Enabled')).toBeInTheDocument();
    await user.click(await screen.findByRole('button', { name: 'Enabled' }));
    await user.click(await screen.findByRole('option', { name: 'Disabled' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText(DETAILS_PAGE_TEXT)).toBeInTheDocument();
    expect(await screen.findByText('Consumer: Disabled')).toBeInTheDocument();
  }, 15000);

  test('should show the leaderboard help text in a popover', async () => {
    const user = userEvent.setup();
    server.use(http.get(collectionStatusUrl, () => HttpResponse.json(collectionStatus)));

    renderEdit();
    await screen.findByRole('button', { name: 'Enabled' });
    await user.click(screen.getByRole('button', { name: '' }));

    expect(
      await screen.findByText('Automation Leaderboards: Enabled/Disabled')
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Controls whether the Automation Leaderboard is visible/)
    ).toBeInTheDocument();
  });

  test('should keep the form and the unsaved selection when a background poll fails', async () => {
    const user = userEvent.setup();
    let getCount = 0;
    server.use(
      http.get(collectionStatusUrl, () => {
        getCount += 1;
        return getCount === 1
          ? HttpResponse.json(collectionStatus)
          : HttpResponse.json({ detail: 'blip' }, { status: 500 });
      })
    );

    renderEdit(<Poller />);
    await user.click(await screen.findByRole('button', { name: 'Enabled' }));
    await user.click(await screen.findByRole('option', { name: 'Disabled' }));
    expect(await screen.findByText('Poll failed')).toBeInTheDocument();

    expect(screen.queryByText('Internal Server Error')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Disabled' })).toBeInTheDocument();
  }, 15000);

  test('should return to details without saving on cancel', async () => {
    const user = userEvent.setup();
    let postCalled = false;
    server.use(
      http.get(collectionStatusUrl, () => HttpResponse.json(collectionStatus)),
      http.post(collectionStatusUrl, () => {
        postCalled = true;
        return HttpResponse.json(collectionStatus);
      })
    );

    renderEdit();
    await user.click(await screen.findByRole('button', { name: 'Cancel' }));

    expect(await screen.findByText(DETAILS_PAGE_TEXT)).toBeInTheDocument();
    expect(postCalled).toBe(false);
  });

  test('should stay on the form and show an error when saving fails', async () => {
    const user = userEvent.setup();
    server.use(
      http.get(collectionStatusUrl, () => HttpResponse.json(collectionStatus)),
      http.post(collectionStatusUrl, () =>
        HttpResponse.json({ detail: 'Save failed' }, { status: 400 })
      )
    );

    renderEdit();
    await user.click(await screen.findByRole('button', { name: 'Save' }));

    await waitFor(() => expect(screen.getByText(/Save failed|Bad Request/)).toBeInTheDocument());
    expect(screen.queryByText(DETAILS_PAGE_TEXT)).not.toBeInTheDocument();
  });
});
