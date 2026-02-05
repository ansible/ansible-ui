import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { hubAPI } from '../common/api/formatPath';
import { ExecutionEnvironments } from './ExecutionEnvironments';

const mockExecutionEnvironmentsResponse = {
  meta: {
    count: 2,
  },
  data: [
    {
      id: '123',
      pulp_href: '/api/galaxy/pulp/api/v3/repositories/container/container/123/',
      name: 'test-ee',
      registry: 'default',
      description: 'Test execution environment',
      created_at: '2024-01-01T00:00:00.000000Z',
      updated_at: '2024-01-01T00:00:00.000000Z',
    },
    {
      id: '456',
      pulp_href: '/api/galaxy/pulp/api/v3/repositories/container/container/456/',
      name: 'another-ee',
      registry: 'default',
      description: 'Another execution environment',
      created_at: '2024-01-02T00:00:00.000000Z',
      updated_at: '2024-01-02T00:00:00.000000Z',
    },
  ],
};

const mockEmptyResponse = {
  meta: {
    count: 0,
  },
  data: [],
};

describe('ExecutionEnvironments Component', () => {
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
        http.get(hubAPI`/v3/plugin/execution-environments/repositories/`, () =>
          HttpResponse.json(mockExecutionEnvironmentsResponse)
        )
      );
    });

    it('should render page title and description', async () => {
      render(
        <MemoryRouter>
          <ExecutionEnvironments />
        </MemoryRouter>
      );

      expect(
        await screen.findByRole('heading', { name: 'Execution Environments' })
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'Execution environments are isolated and reproducible environments that provide consistent runtime environments for running Ansible playbooks and roles.'
        )
      ).toBeInTheDocument();
    });

    it('should render correct column headers', async () => {
      render(
        <MemoryRouter>
          <ExecutionEnvironments />
        </MemoryRouter>
      );

      await screen.findByRole('heading', { name: 'Execution Environments' });

      expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    });
  });

  describe('Execution Environments Rendering', () => {
    beforeEach(() => {
      server.use(
        http.get(hubAPI`/v3/plugin/execution-environments/repositories/`, () =>
          HttpResponse.json(mockExecutionEnvironmentsResponse)
        )
      );
    });

    it('should render execution environments from API response', async () => {
      render(
        <MemoryRouter>
          <ExecutionEnvironments />
        </MemoryRouter>
      );

      await screen.findByRole('heading', { name: 'Execution Environments' });

      expect(await screen.findByText('test-ee')).toBeInTheDocument();
      expect(screen.getByText('another-ee')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    beforeEach(() => {
      server.use(
        http.get(hubAPI`/v3/plugin/execution-environments/repositories/`, () =>
          HttpResponse.json(mockEmptyResponse)
        )
      );
    });

    it('should show empty state when no execution environments exist', async () => {
      render(
        <MemoryRouter>
          <ExecutionEnvironments />
        </MemoryRouter>
      );

      await screen.findByRole('heading', { name: 'Execution Environments' });

      await waitFor(() => {
        expect(screen.getByText('No execution environments yet')).toBeInTheDocument();
      });
      expect(
        screen.getByText('To get started, create an execution environment.')
      ).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should render unauthorized state for 403 error', async () => {
      server.use(
        http.get(hubAPI`/v3/plugin/execution-environments/repositories/`, () =>
          HttpResponse.json({ detail: 'Forbidden' }, { status: 403 })
        )
      );

      render(
        <MemoryRouter>
          <ExecutionEnvironments />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(
          screen.getByText('You do not have access to Execution Environments')
        ).toBeInTheDocument();
      });
    });

    it('should render error state for non-403 errors', async () => {
      server.use(
        http.get(hubAPI`/v3/plugin/execution-environments/repositories/`, () =>
          HttpResponse.json({ detail: 'Internal Server Error' }, { status: 500 })
        )
      );

      render(
        <MemoryRouter>
          <ExecutionEnvironments />
        </MemoryRouter>
      );

      await screen.findByRole('heading', { name: 'Execution Environments' });

      await waitFor(() => {
        expect(screen.getByText('Error loading execution environments')).toBeInTheDocument();
      });
    });
  });
});
