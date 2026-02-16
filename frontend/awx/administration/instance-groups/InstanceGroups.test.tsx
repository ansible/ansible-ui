import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { InstanceGroups } from './InstanceGroups';

const mockInstanceGroups = {
  count: 3,
  next: null,
  previous: null,
  results: [
    {
      id: 1,
      type: 'instance_group',
      name: 'controlplane',
      description: '',
      is_container_group: false,
      policy_instance_minimum: 0,
      policy_instance_percentage: 100,
      max_concurrent_jobs: 0,
      max_forks: 0,
      summary_fields: {
        user_capabilities: { edit: true, delete: false },
      },
    },
    {
      id: 2,
      type: 'instance_group',
      name: 'default',
      description: '',
      is_container_group: false,
      policy_instance_minimum: 0,
      policy_instance_percentage: 100,
      max_concurrent_jobs: 0,
      max_forks: 0,
      summary_fields: {
        user_capabilities: { edit: true, delete: false },
      },
    },
    {
      id: 3,
      type: 'instance_group',
      name: 'Container Group 01',
      description: '',
      is_container_group: true,
      policy_instance_minimum: 0,
      policy_instance_percentage: 0,
      max_concurrent_jobs: 0,
      max_forks: 0,
      summary_fields: {
        user_capabilities: { edit: false, delete: false },
      },
    },
  ],
};

const instanceGroupsOptionsWithoutPost = {
  actions: {},
};

const instanceGroupsOptionsWithPost = {
  actions: {
    POST: {
      name: {
        type: 'string',
        required: true,
        label: 'Name',
        max_length: 512,
        help_text: 'Name of this instance group.',
        filterable: true,
      },
    },
  },
  name: 'Instance Groups',
};

const server = setupServer(
  http.get(awxAPI`/config/`, () => HttpResponse.json({ version: '4.5.0' })),
  http.options(awxAPI`/instance_groups/`, () =>
    HttpResponse.json(instanceGroupsOptionsWithoutPost)
  ),
  http.get(awxAPI`/instance_groups/`, () => HttpResponse.json(mockInstanceGroups))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const renderInstanceGroups = () =>
  render(
    <MemoryRouter>
      <InstanceGroups />
    </MemoryRouter>
  );

describe('InstanceGroups', () => {
  describe('Non-empty list', () => {
    it('should render instance groups list with page title', async () => {
      renderInstanceGroups();

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Instance Groups' })).toBeInTheDocument();
      });
    });

    it('should display instance groups in table', async () => {
      renderInstanceGroups();

      await waitFor(() => {
        expect(screen.getByText('controlplane')).toBeInTheDocument();
        expect(screen.getByText('default')).toBeInTheDocument();
        expect(screen.getByText('Container Group 01')).toBeInTheDocument();
      });

      const rows = screen.getAllByRole('row').filter((row) => row.closest('tbody'));
      expect(rows.length).toBe(3);
    });

    it('should disable Create group button when user lacks permission', async () => {
      renderInstanceGroups();

      await waitFor(() => {
        expect(screen.getByText('controlplane')).toBeInTheDocument();
      });

      const createButton = screen.getByTestId('create-group');
      expect(createButton).toHaveAttribute('aria-disabled', 'true');
    });

    it('should have Create group dropdown when user has permission', async () => {
      server.use(
        http.options(awxAPI`/instance_groups/`, () =>
          HttpResponse.json(instanceGroupsOptionsWithPost)
        )
      );

      renderInstanceGroups();

      await waitFor(() => {
        expect(screen.getByText('controlplane')).toBeInTheDocument();
      });

      expect(screen.getByTestId('create-group')).toBeInTheDocument();
    });
  });
});
