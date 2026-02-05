import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { pulpAPI } from '../../common/api/formatPath';
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

const mockEmptyResponse = {
  count: 0,
  results: [],
};

describe('Remotes Component', () => {
  let server: ReturnType<typeof setupServer>;

  beforeAll(() => {
    server = setupServer();
    server.listen({ onUnhandledRequest: 'bypass' });
  });

  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  describe('Page Structure', () => {
    beforeEach(() => {
      server.use(
        http.get(pulpAPI`/remotes/ansible/collection/`, () =>
          HttpResponse.json(mockRemotesResponse)
        )
      );
    });

    it('should render page title and description', async () => {
      render(
        <MemoryRouter>
          <Remotes />
        </MemoryRouter>
      );

      expect(await screen.findByRole('heading', { name: 'Remotes' })).toBeInTheDocument();
      expect(
        screen.getByText(
          'Remotes are external sources that provide a central location for users to search, retrieve, and install Ansible roles and collections.'
        )
      ).toBeInTheDocument();
    });
  });

  describe('Remotes Rendering', () => {
    beforeEach(() => {
      server.use(
        http.get(pulpAPI`/remotes/ansible/collection/`, () =>
          HttpResponse.json(mockRemotesResponse)
        )
      );
    });

    it('should render remotes in table view', async () => {
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

    it('should switch between table, card, and list views', async () => {
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
  });

  describe('Empty State', () => {
    beforeEach(() => {
      server.use(
        http.get(pulpAPI`/remotes/ansible/collection/`, () => HttpResponse.json(mockEmptyResponse))
      );
    });

    it('should render empty state when no remotes', async () => {
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
  });

  describe('Error Handling', () => {
    it('should handle error state', async () => {
      server.use(http.get(pulpAPI`/remotes/ansible/collection/`, () => HttpResponse.error()));

      render(
        <MemoryRouter>
          <Remotes />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Error loading remotes')).toBeInTheDocument();
      });
    });

    it('should render unauthorized state for 403 error', async () => {
      server.use(
        http.get(pulpAPI`/remotes/ansible/collection/`, () =>
          HttpResponse.json({ detail: 'Forbidden' }, { status: 403 })
        )
      );

      render(
        <MemoryRouter>
          <Remotes />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('You do not have access to Remotes')).toBeInTheDocument();
      });
    });

    it('should render error state for non-403 errors', async () => {
      server.use(
        http.get(pulpAPI`/remotes/ansible/collection/`, () =>
          HttpResponse.json({ detail: 'Internal Server Error' }, { status: 500 })
        )
      );

      render(
        <MemoryRouter>
          <Remotes />
        </MemoryRouter>
      );

      await screen.findByRole('heading', { name: 'Remotes' });

      await waitFor(() => {
        expect(screen.getByText('Error loading remotes')).toBeInTheDocument();
      });
    });
  });
});
