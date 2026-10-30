/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { pulpAPI } from '../../../common/api/formatPath';
import { RemoteAssignTeams } from './RemoteAssignTeam';

const mockNavigate = vi.fn();

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    usePageNavigate: () => mockNavigate,
  };
});

vi.mock('../../../common/useHubBulkActionDialog', () => ({
  useHubBulkActionDialog:
    () =>
    (config: {
      items: unknown[];
      actionFn: (item: unknown) => Promise<unknown>;
      onComplete?: () => void;
      onClose?: () => void;
    }) => {
      void (async () => {
        for (const item of config.items) {
          await config.actionFn(item);
        }
        config.onComplete?.();
        config.onClose?.();
      })();
    },
}));

const mockRemote = {
  pulp_href: '/pulp/api/v3/remotes/ansible/collection/12345678-1234-1234-1234-123456789abc/',
  name: 'test-remote',
  url: 'https://galaxy.example.com',
};

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => {
  server.resetHandlers();
  mockNavigate.mockClear();
});
afterAll(() => server.close());

function renderRemoteAssignTeams() {
  render(
    <MemoryRouter initialEntries={['/remotes/test-remote/team-access/add']}>
      <Routes>
        <Route path="/remotes/:id/team-access/add" element={<RemoteAssignTeams />} />
      </Routes>
    </MemoryRouter>
  );
}

function useRemoteHandlers() {
  server.use(
    http.get(pulpAPI`/remotes/ansible/collection/`, ({ request }) => {
      const url = new URL(request.url);
      if (url.searchParams.get('name') === 'test-remote') {
        return HttpResponse.json({ count: 1, results: [mockRemote] });
      }
      return HttpResponse.json({ count: 0, results: [] });
    }),
    http.get('*/teams/*', () =>
      HttpResponse.json({
        count: 1,
        results: [{ id: 1, name: 'ops', url: '/teams/1/' }],
      })
    ),
    http.get('*/role_definitions/*', () =>
      HttpResponse.json({
        count: 1,
        results: [{ id: 4, name: 'galaxy.collection_remote_owner', description: 'Owner' }],
      })
    ),
    http.get('*/service-index/role-types/', () =>
      HttpResponse.json({ results: [{ api_slug: 'galaxy.collectionremote', name: 'Remote' }] })
    ),
    http.get('*/service-index/role-permissions/*', () => HttpResponse.json({ results: [] }))
  );
}

describe('RemoteAssignTeams', () => {
  it('renders assign teams wizard for remote', async () => {
    useRemoteHandlers();
    renderRemoteAssignTeams();

    await waitFor(() => {
      expect(screen.getByTestId('wizard')).toBeInTheDocument();
    });
    expect(screen.getByRole('heading', { name: 'Assign teams' })).toBeInTheDocument();
  });

  it('shows error when remote fails to load', async () => {
    server.use(
      http.get(pulpAPI`/remotes/ansible/collection/`, () =>
        HttpResponse.json({ detail: 'Not found' }, { status: 404 })
      )
    );

    renderRemoteAssignTeams();
    expect(await screen.findByRole('button', { name: /Refresh/i })).toBeInTheDocument();
  });

  it('navigates back on cancel', async () => {
    useRemoteHandlers();
    const user = userEvent.setup();
    renderRemoteAssignTeams();

    await screen.findByTestId('wizard');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(mockNavigate).toHaveBeenCalled();
  });

  it('requires at least one team before continuing the wizard', async () => {
    useRemoteHandlers();
    const user = userEvent.setup();
    renderRemoteAssignTeams();

    await screen.findByTestId('wizard');
    await user.click(screen.getByRole('button', { name: 'Next' }));

    expect(await screen.findByText('Select at least one team.')).toBeInTheDocument();
  });

  it('requires at least one role before continuing the wizard', async () => {
    useRemoteHandlers();
    const user = userEvent.setup();
    renderRemoteAssignTeams();

    await screen.findByText('ops', {}, { timeout: 10000 });
    await user.click(screen.getByRole('checkbox', { name: /Select row/i }));
    await user.click(screen.getByRole('button', { name: /^Next$/ }));

    await waitFor(() => {
      expect(screen.getByText('galaxy.collection_remote_owner')).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /^Next$/ }));

    expect(await screen.findByText('Select at least one role.')).toBeInTheDocument();
  }, 15000);

  it('submits team role assignments from the wizard', async () => {
    useRemoteHandlers();
    server.use(
      http.post('*/role_team_assignments/*', () => HttpResponse.json({ id: 99 }, { status: 201 }))
    );

    const user = userEvent.setup();
    renderRemoteAssignTeams();

    await screen.findByText('ops');
    await user.click(screen.getByRole('checkbox', { name: /Select row/i }));
    await user.click(screen.getByRole('button', { name: /^Next$/ }));

    await waitFor(() => {
      expect(screen.getByText('galaxy.collection_remote_owner')).toBeInTheDocument();
    });

    const roleRow = screen.getByText('galaxy.collection_remote_owner').closest('tr');
    await user.click(within(roleRow as HTMLElement).getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: /^Next$/ }));
    await user.click(screen.getByRole('button', { name: /^Finish$/ }));

    await waitFor(
      () => {
        expect(mockNavigate).toHaveBeenCalled();
      },
      { timeout: 20000 }
    );
  }, 30000);
});
