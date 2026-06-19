import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { CreateInventory, EditInventory } from './InventoryForm';

vi.mock('@ansible/ansible-ui-framework/components/DataEditor', () => ({
  DataEditor: (props: {
    id?: string;
    name: string;
    value: string;
    onChange: (v: string) => void;
  }) => (
    <textarea
      id={props.id ?? props.name}
      name={props.name}
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
      data-testid={props.name}
    />
  ),
}));

const organizationsResponse = {
  count: 1,
  next: null,
  previous: null,
  results: [
    {
      id: 1,
      name: 'Default',
      description: '',
      type: 'organization',
      url: '/api/v2/organizations/1/',
      summary_fields: {},
    },
  ],
};

const instanceGroupsResponse = {
  count: 2,
  next: null,
  previous: null,
  results: [
    { id: 1, name: 'controlplane', type: 'instance_group', url: '/api/v2/instance_groups/1/' },
    { id: 2, name: 'default', type: 'instance_group', url: '/api/v2/instance_groups/2/' },
  ],
};

const labelsResponse = {
  count: 1,
  next: null,
  previous: null,
  results: [{ id: 1, name: 'test label', organization: 1 }],
};

const mockInventory = {
  id: 1,
  name: 'test',
  kind: '' as const,
  description: 'test description',
  organization: 1,
  variables: 'hello:world',
  host_filter: null as string | null,
  prevent_instance_group_fallback: false,
  summary_fields: {
    organization: { id: 1, name: 'Default' },
    labels: { count: 1, results: [{ id: 1, name: 'test label' }] },
    user_capabilities: {},
  },
};

const mockSmartInventory = {
  ...mockInventory,
  id: 2,
  kind: 'smart' as const,
  name: 'smart test',
  description: 'smart test description',
  host_filter: 'name__icontains=local',
  summary_fields: {
    ...mockInventory.summary_fields,
    labels: { count: 0, results: [] },
  },
};

const mockConstructedInventory = {
  ...mockInventory,
  id: 3,
  kind: 'constructed' as const,
  name: 'constructed test',
  description: 'constructed test description',
  summary_fields: {
    ...mockInventory.summary_fields,
    labels: { count: 0, results: [] },
  },
};

const mockInputInventoriesResponse = {
  count: 2,
  next: null,
  previous: null,
  results: [
    { id: 10, name: 'source-inventory-1', type: 'inventory', url: '/api/v2/inventories/10/' },
    { id: 11, name: 'source-inventory-2', type: 'inventory', url: '/api/v2/inventories/11/' },
  ],
};

const inventoryInstanceGroupsResponse = {
  count: 1,
  next: null,
  previous: null,
  results: [{ id: 2, name: 'default', type: 'instance_group', url: '/api/v2/instance_groups/2/' }],
};

const organizationResponse = {
  id: 1,
  name: 'Default',
  description: '',
  type: 'organization',
  url: '/api/v2/organizations/1/',
  summary_fields: {},
};

const server = setupServer(
  http.options(
    ({ request }) => request.url.includes('/organizations/'),
    () => HttpResponse.json({ actions: { GET: {}, POST: {} } })
  ),
  http.get(
    ({ request }) => request.url.includes('/organizations/') && !request.url.includes('/1/'),
    () => HttpResponse.json(organizationsResponse)
  ),
  http.get(
    ({ request }) => request.url.includes('/organizations/1/'),
    () => HttpResponse.json(organizationResponse)
  ),
  http.get(
    ({ request }) =>
      request.url.includes('/instance_groups/') && !request.url.includes('/inventories/'),
    () => HttpResponse.json(instanceGroupsResponse)
  ),
  http.get(
    ({ request }) => request.url.includes('/labels/'),
    () => HttpResponse.json(labelsResponse)
  ),
  http.get(
    ({ request }) =>
      request.url.includes('/inventories/1/') &&
      !request.url.includes('instance_groups') &&
      !request.url.includes('input_inventories'),
    () => HttpResponse.json(mockInventory)
  ),
  http.get(
    ({ request }) =>
      request.url.includes('/inventories/2/') &&
      !request.url.includes('instance_groups') &&
      !request.url.includes('input_inventories'),
    () => HttpResponse.json(mockSmartInventory)
  ),
  http.get(
    ({ request }) =>
      request.url.includes('/constructed_inventories/3/') &&
      !request.url.includes('instance_groups') &&
      !request.url.includes('input_inventories'),
    () => HttpResponse.json(mockConstructedInventory)
  ),
  http.get(
    ({ request }) => request.url.includes('/inventories/3/input_inventories/'),
    () => HttpResponse.json(mockInputInventoriesResponse)
  ),
  http.get(
    ({ request }) => request.url.includes('/inventories/1/instance_groups/'),
    () => HttpResponse.json(inventoryInstanceGroupsResponse)
  ),
  http.get(
    ({ request }) => request.url.includes('/inventories/2/instance_groups/'),
    () => HttpResponse.json(inventoryInstanceGroupsResponse)
  ),
  http.get(
    ({ request }) => request.url.includes('/inventories/3/instance_groups/'),
    () => HttpResponse.json(inventoryInstanceGroupsResponse)
  ),
  http.options(
    ({ request }) => request.url.includes('/instance_groups/'),
    () => HttpResponse.json({ actions: { GET: {}, POST: {} } })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('InventoryForm', () => {
  describe('CreateInventory', () => {
    it('should render create regular inventory form with Create button', async () => {
      render(
        <MemoryRouter initialEntries={['/inventories/inventory/create']}>
          <Routes>
            <Route
              path="/inventories/:inventory_type/create"
              element={<CreateInventory inventoryKind="" />}
            />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create inventory/i })).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/enter inventory name/i)).toBeInTheDocument();
    });

    it('should render create smart inventory form with host filter field', async () => {
      render(
        <MemoryRouter initialEntries={['/inventories/smart_inventory/create']}>
          <Routes>
            <Route
              path="/inventories/:inventory_type/create"
              element={<CreateInventory inventoryKind="smart" />}
            />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create inventory/i })).toBeInTheDocument();
      });

      expect(screen.getByLabelText(/smart host filter/i)).toBeInTheDocument();
    });

    it('should display variables and policy enforcement fields', async () => {
      render(
        <MemoryRouter initialEntries={['/inventories/inventory/create']}>
          <Routes>
            <Route
              path="/inventories/:inventory_type/create"
              element={<CreateInventory inventoryKind="" />}
            />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create inventory/i })).toBeInTheDocument();
      });

      expect(screen.getByTestId('variables')).toBeInTheDocument();
      expect(screen.getByText(/policy enforcement/i)).toBeInTheDocument();
    });

    it('should not submit regular inventory when required fields are empty', async () => {
      const postSpy = vi.fn();
      server.use(
        http.post(
          ({ request }) => request.url.includes('/inventories/'),
          async ({ request }) => {
            postSpy(await request.json());
            return HttpResponse.json({ id: 999 }, { status: 201 });
          }
        )
      );

      const user = userEvent.setup();
      render(
        <MemoryRouter initialEntries={['/inventories/inventory/create']}>
          <Routes>
            <Route
              path="/inventories/:inventory_type/create"
              element={<CreateInventory inventoryKind="" />}
            />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create inventory/i })).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('Submit'));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create inventory/i })).toBeInTheDocument();
      });

      expect(postSpy).not.toHaveBeenCalled();
    });

    it('should not submit smart inventory when required fields are empty', async () => {
      const postSpy = vi.fn();
      server.use(
        http.post(
          ({ request }) => request.url.includes('/inventories/'),
          async ({ request }) => {
            postSpy(await request.json());
            return HttpResponse.json({ id: 999 }, { status: 201 });
          }
        )
      );

      const user = userEvent.setup();
      render(
        <MemoryRouter initialEntries={['/inventories/smart_inventory/create']}>
          <Routes>
            <Route
              path="/inventories/:inventory_type/create"
              element={<CreateInventory inventoryKind="smart" />}
            />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create inventory/i })).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('Submit'));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create inventory/i })).toBeInTheDocument();
      });

      expect(postSpy).not.toHaveBeenCalled();
    });
  });

  describe('EditInventory', () => {
    it('should preload regular inventory form with correct values', async () => {
      render(
        <MemoryRouter initialEntries={['/inventories/inventory/1/edit']}>
          <Routes>
            <Route path="/inventories/:inventory_type/:id/edit" element={<EditInventory />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('test')).toBeInTheDocument();
      });

      expect(screen.getByDisplayValue('test description')).toBeInTheDocument();
      expect(screen.getByTestId('variables')).toHaveValue('hello:world');
      expect(screen.getByRole('button', { name: /save inventory/i })).toBeInTheDocument();
    });

    it('should preload smart inventory form with host filter', async () => {
      render(
        <MemoryRouter initialEntries={['/inventories/smart_inventory/2/edit']}>
          <Routes>
            <Route path="/inventories/:inventory_type/:id/edit" element={<EditInventory />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('smart test')).toBeInTheDocument();
      });

      expect(screen.getByDisplayValue('name__icontains=local')).toBeInTheDocument();
    });

    it('should pass correct body when editing inventory', async () => {
      let patchPayload: Record<string, unknown> = {};
      server.use(
        http.patch(awxAPI`/inventories/1/`, async ({ request }) => {
          patchPayload = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json({ ...mockInventory, ...patchPayload });
        })
      );

      const user = userEvent.setup();
      render(
        <MemoryRouter initialEntries={['/inventories/inventory/1/edit']}>
          <Routes>
            <Route path="/inventories/:inventory_type/:id/edit" element={<EditInventory />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('test')).toBeInTheDocument();
      });

      const nameInput = screen.getByDisplayValue('test');
      await user.clear(nameInput);
      await user.type(nameInput, 'Edited name');
      await user.click(screen.getByRole('button', { name: /save inventory/i }));

      await waitFor(() => {
        expect(patchPayload.name).toBe('Edited name');
      });
    });

    it('should display error alert when server returns 500 on save', async () => {
      server.use(
        http.patch(awxAPI`/inventories/1/`, () =>
          HttpResponse.json({ detail: 'Internal Server Error' }, { status: 500 })
        )
      );

      const user = userEvent.setup();
      render(
        <MemoryRouter initialEntries={['/inventories/inventory/1/edit']}>
          <Routes>
            <Route path="/inventories/:inventory_type/:id/edit" element={<EditInventory />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('test')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /save inventory/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
      expect(screen.getByText('Internal Server Error')).toBeInTheDocument();
    });

    it('should preload constructed inventory form with input inventories from all pages', async () => {
      render(
        <MemoryRouter initialEntries={['/inventories/constructed_inventory/3/edit']}>
          <Routes>
            <Route path="/inventories/:inventory_type/:id/edit" element={<EditInventory />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('constructed test')).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /save inventory/i })).toBeInTheDocument();
    });

    it('should show error when input_inventories fetch fails for constructed inventory', async () => {
      // Use id: 4 to avoid SWR cache from the id: 3 preload test above. All handlers
      // for this inventory are set up here so the test is self-contained.
      server.use(
        http.get(
          ({ request }) =>
            request.url.includes('/constructed_inventories/4/') &&
            !request.url.includes('instance_groups') &&
            !request.url.includes('input_inventories'),
          () => HttpResponse.json({ ...mockConstructedInventory, id: 4 })
        ),
        http.get(
          ({ request }) => request.url.includes('/inventories/4/instance_groups/'),
          () => HttpResponse.json(inventoryInstanceGroupsResponse)
        ),
        http.get(
          ({ request }) => request.url.includes('/inventories/4/input_inventories/'),
          () => HttpResponse.json({ detail: 'Forbidden' }, { status: 403 })
        )
      );

      render(
        <MemoryRouter initialEntries={['/inventories/constructed_inventory/4/edit']}>
          <Routes>
            <Route path="/inventories/:inventory_type/:id/edit" element={<EditInventory />} />
          </Routes>
        </MemoryRouter>
      );

      // AwxError renders an EmptyState (no role="alert"); the heading is the HTTP status message.
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Forbidden' })).toBeInTheDocument();
      });
    });
  });
});
