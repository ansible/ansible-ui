/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { pulpAPI } from '../../../common/api/formatPath';
import { RemoteAddUsers } from './RemoteAddUser';

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

const mockUsers = {
  count: 1,
  next: null,
  previous: null,
  results: [{ id: 1, username: 'demo-user', first_name: '', last_name: '' }],
};

const mockRoles = {
  count: 1,
  next: null,
  previous: null,
  results: [{ id: 4, name: 'galaxy.collection_remote_owner', description: 'Owner' }],
};

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => {
  server.resetHandlers();
  mockNavigate.mockClear();
});
afterAll(() => server.close());

function renderRemoteAddUsers() {
  render(
    <MemoryRouter initialEntries={['/remotes/test-remote/user-access/add']}>
      <Routes>
        <Route path="/remotes/:id/user-access/add" element={<RemoteAddUsers />} />
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
    http.get('*/users/*', () => HttpResponse.json(mockUsers)),
    http.get('*/role_definitions/*', () => HttpResponse.json(mockRoles)),
    http.get('*/service-index/role-types/', () =>
      HttpResponse.json({ results: [{ api_slug: 'galaxy.collectionremote', name: 'Remote' }] })
    ),
    http.get('*/service-index/role-permissions/*', () => HttpResponse.json({ results: [] }))
  );
}

describe('RemoteAddUsers', () => {
  it('renders assign users wizard for remote', async () => {
    useRemoteHandlers();
    renderRemoteAddUsers();

    await waitFor(() => {
      expect(screen.getByTestId('wizard')).toBeInTheDocument();
    });
    expect(screen.getByRole('heading', { name: 'Assign users' })).toBeInTheDocument();
  });

  it('shows error when remote fails to load', async () => {
    server.use(
      http.get(pulpAPI`/remotes/ansible/collection/`, () =>
        HttpResponse.json({ detail: 'Not found' }, { status: 404 })
      )
    );

    renderRemoteAddUsers();
    expect(await screen.findByRole('button', { name: /Refresh/i })).toBeInTheDocument();
  });

  it('navigates back on cancel', async () => {
    useRemoteHandlers();
    const user = userEvent.setup();
    renderRemoteAddUsers();

    await screen.findByTestId('wizard');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(mockNavigate).toHaveBeenCalled();
  });

  it('requires at least one user before continuing the wizard', async () => {
    useRemoteHandlers();
    const user = userEvent.setup();
    renderRemoteAddUsers();

    await screen.findByTestId('wizard');
    await user.click(screen.getByRole('button', { name: 'Next' }));

    expect(await screen.findByText('Select at least one user.')).toBeInTheDocument();
  });

  it('requires at least one role before continuing the wizard', async () => {
    useRemoteHandlers();
    const user = userEvent.setup();
    renderRemoteAddUsers();

    await screen.findByText('demo-user', {}, { timeout: 10000 });
    await user.click(screen.getByRole('checkbox', { name: /Select row/i }));
    await user.click(screen.getByRole('button', { name: /^Next$/ }));

    await waitFor(() => {
      expect(screen.getByText('galaxy.collection_remote_owner')).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /^Next$/ }));

    expect(await screen.findByText('Select at least one role.')).toBeInTheDocument();
  }, 15000);

  it('submits user role assignments from the wizard', async () => {
    useRemoteHandlers();
    server.use(
      http.post('*/role_user_assignments/*', () => HttpResponse.json({ id: 99 }, { status: 201 }))
    );

    const user = userEvent.setup();
    renderRemoteAddUsers();

    await screen.findByText('demo-user');
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
