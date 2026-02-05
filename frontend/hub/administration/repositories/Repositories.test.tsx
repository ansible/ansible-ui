import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { pulpAPI } from '../../common/api/formatPath';
import { Repositories } from './Repositories';

const mockRepositoriesResponse = {
  count: 2,
  results: [
    {
      description: 'Test repository description',
      gpgkey: null,
      last_sync_task: {
        finished_at: '2024-01-01T00:01:00.000000Z',
        started_at: '2024-01-01T00:00:00.000000Z',
        state: 'completed',
        task_id: 'task-1',
      },
      last_synced_metadata_time: null,
      latest_version_href: '/api/galaxy/pulp/api/v3/repositories/ansible/ansible/123/versions/1/',
      name: 'test-repository',
      private: false,
      pulp_created: '2024-01-01T00:00:00.000000Z',
      pulp_href: '/api/galaxy/pulp/api/v3/repositories/ansible/ansible/123/',
      pulp_labels: {},
      remote: null,
      retain_repo_versions: null,
      versions_href: '/api/galaxy/pulp/api/v3/repositories/ansible/ansible/123/versions/',
    },
    {
      description: 'Another repository description',
      gpgkey: null,
      last_sync_task: {
        finished_at: '2024-01-02T00:01:00.000000Z',
        started_at: '2024-01-02T00:00:00.000000Z',
        state: 'completed',
        task_id: 'task-2',
      },
      last_synced_metadata_time: null,
      latest_version_href: '/api/galaxy/pulp/api/v3/repositories/ansible/ansible/456/versions/1/',
      name: 'another-repository',
      private: false,
      pulp_created: '2024-01-02T00:00:00.000000Z',
      pulp_href: '/api/galaxy/pulp/api/v3/repositories/ansible/ansible/456/',
      pulp_labels: {},
      remote: null,
      retain_repo_versions: null,
      versions_href: '/api/galaxy/pulp/api/v3/repositories/ansible/ansible/456/versions/',
    },
  ],
};

const mockEmptyResponse = {
  count: 0,
  results: [],
};

describe('Repositories Component', () => {
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
        http.get(pulpAPI`/repositories/ansible/ansible/`, () =>
          HttpResponse.json(mockRepositoriesResponse)
        )
      );
    });

    it('should render page title and description', async () => {
      render(
        <MemoryRouter>
          <Repositories />
        </MemoryRouter>
      );

      expect(await screen.findByRole('heading', { name: 'Repositories' })).toBeInTheDocument();
      expect(
        screen.getByText(
          'Repositories are online storage locations where Ansible content, such as roles and collections, can be published, shared, and accessed by the community.'
        )
      ).toBeInTheDocument();
    });

    it('should render correct column headers', async () => {
      render(
        <MemoryRouter>
          <Repositories />
        </MemoryRouter>
      );

      await screen.findByRole('heading', { name: 'Repositories' });

      expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    });
  });

  describe('Repositories Rendering', () => {
    beforeEach(() => {
      server.use(
        http.get(pulpAPI`/repositories/ansible/ansible/`, () =>
          HttpResponse.json(mockRepositoriesResponse)
        )
      );
    });

    it('should render repositories from API response', async () => {
      render(
        <MemoryRouter>
          <Repositories />
        </MemoryRouter>
      );

      await screen.findByRole('heading', { name: 'Repositories' });

      expect(await screen.findByText('test-repository')).toBeInTheDocument();
      expect(screen.getByText('another-repository')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    beforeEach(() => {
      server.use(
        http.get(pulpAPI`/repositories/ansible/ansible/`, () =>
          HttpResponse.json(mockEmptyResponse)
        )
      );
    });

    it('should show empty state when no repositories exist', async () => {
      render(
        <MemoryRouter>
          <Repositories />
        </MemoryRouter>
      );

      await screen.findByRole('heading', { name: 'Repositories' });

      await waitFor(() => {
        expect(screen.getByText('No repositories yet')).toBeInTheDocument();
      });
      expect(
        screen.getByText('You can create a repository to store and share Ansible content.')
      ).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should render unauthorized state for 403 error', async () => {
      server.use(
        http.get(pulpAPI`/repositories/ansible/ansible/`, () =>
          HttpResponse.json({ detail: 'Forbidden' }, { status: 403 })
        )
      );

      render(
        <MemoryRouter>
          <Repositories />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('You do not have access to Repositories')).toBeInTheDocument();
      });
    });

    it('should render error state for non-403 errors', async () => {
      server.use(
        http.get(pulpAPI`/repositories/ansible/ansible/`, () =>
          HttpResponse.json({ detail: 'Internal Server Error' }, { status: 500 })
        )
      );

      render(
        <MemoryRouter>
          <Repositories />
        </MemoryRouter>
      );

      await screen.findByRole('heading', { name: 'Repositories' });

      await waitFor(() => {
        expect(screen.getByText('Error loading repositories')).toBeInTheDocument();
      });
    });
  });
});
