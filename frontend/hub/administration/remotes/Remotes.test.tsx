import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest';
import { HubRemote, Remotes } from './Remotes';

const mockRemotes: HubRemote[] = [
  {
    pulp_href: '/api/galaxy/api/v3/remotes/ansible/collection/1/',
    pulp_created: '2025-01-01T00:00:00.000000Z',
    name: 'test-remote',
    url: 'https://console.redhat.com/api/automation-hub/',
    ca_cert: null,
    client_cert: null,
    download_concurrency: 10,
    rate_limit: null,
    requirements_file: null,
    tls_validation: true,
    signed_only: false,
    sync_dependencies: false,
    auth_url: null,
    proxy_url: null,
  },
];

const mockRemotesResponse = {
  count: 1,
  results: mockRemotes,
};

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    usePageNavigate: () => vi.fn(),
    useGetPageUrl: () => (route: string) => `/mock-url/${route}`,
  };
});

vi.mock('../../common/useHubContext', () => ({
  useHubContext: () => ({
    featureFlags: {},
    settings: {},
    user: null,
    hasPermission: () => true,
  }),
}));

vi.mock('../../common/useHubConfig', () => ({
  useHubConfig: () => ({
    server: {},
  }),
}));

vi.mock('./hooks/useRemoteActions', () => ({
  useRemoteActions: () => [],
}));

vi.mock('./hooks/useRemoteToolbarActions', () => ({
  useRemoteToolbarActions: () => [],
}));

describe('Remotes', () => {
  const server = setupServer(
    http.get(
      ({ request }) => {
        return request.url.includes('/remotes/ansible/collection/');
      },
      () => {
        return HttpResponse.json(mockRemotesResponse);
      }
    )
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  test('should render remotes in table view', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Remotes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('test-remote')).toBeInTheDocument();
    });

    const tableViewButton = screen.getByTestId('table-view');
    await user.click(tableViewButton);

    await waitFor(() => {
      expect(screen.getByRole('row', { name: /test-remote/i })).toBeInTheDocument();
    });
  });

  test('should switch between table, card, and list views', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Remotes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('test-remote')).toBeInTheDocument();
    });

    // Switch to table view
    const tableViewButton = screen.getByTestId('table-view');
    await user.click(tableViewButton);

    await waitFor(() => {
      expect(screen.getByText('test-remote')).toBeInTheDocument();
    });

    // Switch to card view (default view)
    const cardViewButton = screen.getByTestId('card-view');
    await user.click(cardViewButton);

    await waitFor(() => {
      expect(screen.getByText('test-remote')).toBeInTheDocument();
    });

    // Switch to list view
    const listViewButton = screen.getByTestId('list-view');
    await user.click(listViewButton);

    await waitFor(() => {
      expect(screen.getByText('test-remote')).toBeInTheDocument();
    });
  });

  test('should render empty state when no remotes', async () => {
    server.use(
      http.get(
        ({ request }) => {
          return request.url.includes('/remotes/ansible/collection/');
        },
        () => {
          return HttpResponse.json({ count: 0, results: [] });
        }
      )
    );

    render(
      <MemoryRouter>
        <Remotes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No remotes yet')).toBeInTheDocument();
    });

    expect(
      screen.getByText(
        'You can create a remote to provide a central location for users to search, retrieve, and install Ansible roles and collections.'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Create remote')).toBeInTheDocument();
  });

  test('should handle error state', async () => {
    server.use(
      http.get(
        ({ request }) => {
          return request.url.includes('/remotes/ansible/collection/');
        },
        () => {
          return HttpResponse.error();
        }
      )
    );

    render(
      <MemoryRouter>
        <Remotes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Error loading remotes')).toBeInTheDocument();
    });
  });
});
