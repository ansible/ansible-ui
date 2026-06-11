import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { InventoryGroup } from '../../../interfaces/InventoryGroup';
import { InventoryHostGroups } from './InventoryHostGroups';

const mockInventorySummary = {
  id: 12141,
  name: 'test inventory',
  description: '',
  has_active_failures: false,
  has_inventory_sources: false,
  hosts_with_active_failures: 0,
  inventory_sources_with_failures: 0,
  kind: '',
  organization_id: 1,
  total_groups: 4,
  total_hosts: 1,
  total_inventory_sources: 0,
};

const mockHost = {
  id: 1,
  name: 'test-host',
  inventory: 1,
  enabled: true,
  variables: '---',
  created: '2024-01-01T00:00:00Z',
  modified: '2024-01-01T00:00:00Z',
  summary_fields: {
    inventory: { id: 1, name: 'Default', kind: '' },
    created_by: { id: 1, username: 'admin' },
    modified_by: { id: 1, username: 'admin' },
    recent_jobs: [],
  },
};

const mockGroups: AwxItemsResponse<InventoryGroup> = {
  count: 4,
  next: null,
  previous: null,
  results: [
    {
      id: 430,
      name: 'Test groups 1',
      type: 'group',
      url: '/api/v2/groups/430/',
      inventory: 12141,
      variables: '---',
      created: '2024-01-24T19:31:38.517172Z',
      modified: '2024-01-24T19:31:38.517186Z',
      summary_fields: {
        groups: { results: [], count: 0 },
        inventory: mockInventorySummary,
        created_by: { id: 3, username: 'dev' },
        modified_by: { id: 3, username: 'dev' },
        user_capabilities: { edit: true, delete: true, copy: true },
      },
      related: {} as never,
    },
    {
      id: 431,
      name: 'Test group 2',
      type: 'group',
      url: '/api/v2/groups/431/',
      inventory: 12141,
      variables: '---',
      created: '2024-01-24T19:31:51.120495Z',
      modified: '2024-01-24T19:31:51.120517Z',
      summary_fields: {
        groups: { results: [], count: 0 },
        inventory: mockInventorySummary,
        created_by: { id: 3, username: 'dev' },
        modified_by: { id: 3, username: 'dev' },
        user_capabilities: { edit: true, delete: true, copy: true },
      },
      related: {} as never,
    },
  ],
};

const groupsWithEditDisabled = {
  ...mockGroups,
  results: mockGroups.results.map((g) => ({
    ...g,
    summary_fields: {
      ...g.summary_fields,
      user_capabilities: { ...g.summary_fields.user_capabilities, edit: false },
    },
  })),
};

const groupsOptionsWithPost = {
  actions: { POST: { name: { type: 'string', required: true } }, GET: {} },
};

const groupsOptionsWithoutPost = { actions: { GET: {} } };

const allGroupsOptions = {
  actions: {
    GET: {
      id: { type: 'integer', label: 'ID', filterable: true },
      name: { type: 'string', label: 'Name', filterable: true },
      description: { type: 'string', label: 'Description', filterable: true },
    },
  },
};

const adHocCommandsOptions = { actions: { GET: {}, POST: {} } };

const server = setupServer(
  http.get(
    ({ request }: { request: Request }) =>
      request.url.includes('/hosts/') && !request.url.includes('all_groups'),
    () => HttpResponse.json(mockHost)
  ),
  http.options(awxAPI`/groups/`, () => HttpResponse.json(groupsOptionsWithPost)),
  http.options(
    ({ request }: { request: Request }) =>
      request.url.includes('/hosts/') && request.url.includes('all_groups'),
    () => HttpResponse.json(allGroupsOptions)
  ),
  http.options(
    ({ request }: { request: Request }) =>
      request.url.includes('/inventories/') && request.url.includes('ad_hoc_commands'),
    () => HttpResponse.json(adHocCommandsOptions)
  ),
  http.get(
    ({ request }: { request: Request }) =>
      request.url.includes('/hosts/') && request.url.includes('all_groups'),
    () => HttpResponse.json(mockGroups)
  ),
  http.get(
    ({ request }: { request: Request }) =>
      request.url.includes('/inventories/') && request.url.endsWith('/'),
    ({ request }: { request: Request }) => {
      const match = /\/inventories\/(\d+)\//.exec(request.url);
      const id = match ? Number.parseInt(match[1] ?? '1', 10) : 1;
      return HttpResponse.json({
        id,
        type: 'inventory',
        name: 'Default',
      });
    }
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderInventoryHostGroups(page: 'inventory' | 'host', initialEntry: string) {
  const path =
    page === 'inventory'
      ? '/inventories/:inventory_type/:id/hosts/:host_id/groups'
      : '/hosts/:id/groups';
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path={path} element={<InventoryHostGroups page={page} />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('InventoryHostGroups', () => {
  it('should render groups list for inventory host page', async () => {
    renderInventoryHostGroups('inventory', '/inventories/inventory/1/hosts/1/groups');

    await waitFor(() => {
      expect(screen.getByText('Test groups 1')).toBeInTheDocument();
      expect(screen.getByText('Test group 2')).toBeInTheDocument();
    });
  });

  it('should render groups list for standalone host page', async () => {
    renderInventoryHostGroups('host', '/hosts/1/groups');

    await waitFor(() => {
      expect(screen.getByText('Test groups 1')).toBeInTheDocument();
      expect(screen.getByText('Test group 2')).toBeInTheDocument();
    });
  });

  it('should show Associate group button when user has permission', async () => {
    renderInventoryHostGroups('inventory', '/inventories/inventory/1/hosts/1/groups');

    await waitFor(() => {
      expect(screen.getByText('Test groups 1')).toBeInTheDocument();
    });

    const associateBtn = screen.getByRole('button', { name: /Associate group/ });
    expect(associateBtn).not.toHaveAttribute('aria-disabled', 'true');
  });

  it('should show empty state with Associate groups when user has permission', async () => {
    server.use(
      http.get(
        ({ request }: { request: Request }) => request.url.includes('all_groups'),
        () => HttpResponse.json({ count: 0, results: [], next: null, previous: null })
      )
    );

    renderInventoryHostGroups('inventory', '/inventories/inventory/1/hosts/1/groups');

    await waitFor(() => {
      expect(screen.getByText('There are currently no groups.')).toBeInTheDocument();
      expect(screen.getByText('Associate a group to populate this list.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Associate groups/ })).toBeInTheDocument();
    });
  });

  it('should show permission message when user cannot add group', async () => {
    server.use(
      http.options(awxAPI`/groups/`, () => HttpResponse.json(groupsOptionsWithoutPost)),
      http.get(
        ({ request }: { request: Request }) => request.url.includes('all_groups'),
        () => HttpResponse.json({ count: 0, results: [], next: null, previous: null })
      )
    );

    renderInventoryHostGroups('inventory', '/inventories/inventory/1/hosts/1/groups');

    await waitFor(() => {
      expect(screen.getByText('You do not have permission to add a group')).toBeInTheDocument();
      expect(
        screen.getByText(
          /Please contact your organization administrator if there is an issue with your access/
        )
      ).toBeInTheDocument();
    });

    expect(screen.queryByRole('button', { name: /Associate group/ })).not.toBeInTheDocument();
  });

  it('should disable Associate group when user lacks permission', async () => {
    server.use(http.options(awxAPI`/groups/`, () => HttpResponse.json(groupsOptionsWithoutPost)));

    renderInventoryHostGroups('inventory', '/inventories/inventory/1/hosts/1/groups');

    await waitFor(() => {
      expect(screen.getByText('Test groups 1')).toBeInTheDocument();
    });

    const associateBtn = screen.getByRole('button', { name: /Associate group/ });
    expect(associateBtn).toHaveAttribute('aria-disabled', 'true');
  });

  it('should display error when groups fail to load', async () => {
    server.use(
      http.get(
        ({ request }: { request: Request }) => request.url.includes('all_groups'),
        () => new HttpResponse(null, { status: 500 })
      )
    );

    renderInventoryHostGroups('inventory', '/inventories/inventory/1/hosts/1/groups');

    await waitFor(() => {
      expect(screen.getByText('Error loading associated groups')).toBeInTheDocument();
    });
  });

  it('should disable Edit group when user lacks edit capability', async () => {
    server.use(
      http.get(
        ({ request }: { request: Request }) => request.url.includes('all_groups'),
        () => HttpResponse.json(groupsWithEditDisabled)
      )
    );

    renderInventoryHostGroups('inventory', '/inventories/inventory/1/hosts/1/groups');

    await waitFor(() => {
      expect(screen.getByText('Test groups 1')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByRole('button', { name: /Edit group/ });
    expect(editButtons.length).toBeGreaterThan(0);
    expect(editButtons[0]).toHaveAttribute('aria-disabled', 'true');
  });
});
