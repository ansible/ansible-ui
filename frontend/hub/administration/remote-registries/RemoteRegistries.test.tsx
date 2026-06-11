import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { hubAPI } from '../../common/api/formatPath';
import { RemoteRegistries } from './RemoteRegistries';

const mockRemoteRegistriesResponse = {
  count: 2,
  results: [
    {
      id: '123',
      pulp_href: '/api/galaxy/pulp/api/v3/registries/123/',
      name: 'test-registry',
      url: 'https://registry.example.com',
      policy: 'immediate' as const,
      created_at: '2024-01-01T00:00:00.000000Z',
      updated_at: '2024-01-01T00:00:00.000000Z',
      tls_validation: true,
      client_cert: null,
      ca_cert: null,
      last_sync_task: {
        task_id: 'task-1',
        state: 'completed' as const,
        started_at: '2024-01-01T00:00:00.000000Z',
        finished_at: '2024-01-01T00:01:00.000000Z',
        error: null,
      },
      download_concurrency: 10,
      proxy_url: null,
      write_only_fields: [],
      rate_limit: null,
      is_indexable: true,
    },
    {
      id: '456',
      pulp_href: '/api/galaxy/pulp/api/v3/registries/456/',
      name: 'another-registry',
      url: 'https://another-registry.example.com',
      policy: 'immediate' as const,
      created_at: '2024-01-02T00:00:00.000000Z',
      updated_at: '2024-01-02T00:00:00.000000Z',
      tls_validation: true,
      client_cert: null,
      ca_cert: null,
      last_sync_task: {
        task_id: 'task-2',
        state: 'completed' as const,
        started_at: '2024-01-02T00:00:00.000000Z',
        finished_at: '2024-01-02T00:01:00.000000Z',
        error: null,
      },
      download_concurrency: 10,
      proxy_url: null,
      write_only_fields: [],
      rate_limit: null,
      is_indexable: true,
    },
  ],
};

const mockEmptyResponse = {
  count: 0,
  results: [],
};

describe('RemoteRegistries Component', () => {
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
        http.get(hubAPI`/_ui/v1/execution-environments/registries/`, () =>
          HttpResponse.json(mockRemoteRegistriesResponse)
        )
      );
    });

    it('should render page title and description', async () => {
      render(
        <MemoryRouter>
          <RemoteRegistries />
        </MemoryRouter>
      );

      expect(await screen.findByRole('heading', { name: 'Remote Registries' })).toBeInTheDocument();
      expect(
        screen.getByText(
          'Remote registries provide a central location for users to search, retrieve, and install Ansible content.'
        )
      ).toBeInTheDocument();
    });

    it('should render correct column headers', async () => {
      render(
        <MemoryRouter>
          <RemoteRegistries />
        </MemoryRouter>
      );

      await screen.findByRole('heading', { name: 'Remote Registries' });

      expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    });
  });

  describe('Remote Registries Rendering', () => {
    beforeEach(() => {
      server.use(
        http.get(hubAPI`/_ui/v1/execution-environments/registries/`, () =>
          HttpResponse.json(mockRemoteRegistriesResponse)
        )
      );
    });

    it('should render remote registries from API response', async () => {
      render(
        <MemoryRouter>
          <RemoteRegistries />
        </MemoryRouter>
      );

      await screen.findByRole('heading', { name: 'Remote Registries' });

      expect(await screen.findByText('test-registry')).toBeInTheDocument();
      expect(screen.getByText('another-registry')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    beforeEach(() => {
      server.use(
        http.get(hubAPI`/_ui/v1/execution-environments/registries/`, () =>
          HttpResponse.json(mockEmptyResponse)
        )
      );
    });

    it('should show empty state when no remote registries exist', async () => {
      render(
        <MemoryRouter>
          <RemoteRegistries />
        </MemoryRouter>
      );

      await screen.findByRole('heading', { name: 'Remote Registries' });

      await waitFor(() => {
        expect(screen.getByText('No remote registries yet')).toBeInTheDocument();
      });
      expect(
        screen.getByText(
          'You can create a remote registry to manage configurations for remote execution environments.'
        )
      ).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should render unauthorized state for 403 error', async () => {
      server.use(
        http.get(hubAPI`/_ui/v1/execution-environments/registries/`, () =>
          HttpResponse.json({ detail: 'Forbidden' }, { status: 403 })
        )
      );

      render(
        <MemoryRouter>
          <RemoteRegistries />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('You do not have access to Remote Registries')).toBeInTheDocument();
      });
    });

    it('should render error state for non-403 errors', async () => {
      server.use(
        http.get(hubAPI`/_ui/v1/execution-environments/registries/`, () =>
          HttpResponse.json({ detail: 'Internal Server Error' }, { status: 500 })
        )
      );

      render(
        <MemoryRouter>
          <RemoteRegistries />
        </MemoryRouter>
      );

      await screen.findByRole('heading', { name: 'Remote Registries' });

      await waitFor(() => {
        expect(screen.getByText('Error loading remote registries')).toBeInTheDocument();
      });
    });
  });
});
