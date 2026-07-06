import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import type { Inventory } from '../../../interfaces/Inventory';
import { InventoryDetailsInner as InventoryDetails } from './InventoryDetails';

const instanceGroupsResponse = {
  count: 3,
  next: null,
  previous: null,
  results: [
    { id: 1, name: 'controlplane', type: 'instance_group' },
    { id: 2, name: 'default', type: 'instance_group' },
    { id: 3, name: 'Container Group 01', type: 'instance_group', is_container_group: true },
  ],
};

const baseInventory: Inventory = {
  id: 9,
  type: 'inventory',
  name: 'test inventory',
  description: '',
  organization: 1,
  kind: '',
  host_filter: null,
  variables: '---',
  total_hosts: 1,
  hosts_with_active_failures: 0,
  total_groups: 0,
  total_inventory_sources: 0,
  inventory_sources_with_failures: 0,
  summary_fields: {
    organization: { id: 1, name: 'Default', description: '' },
    labels: { count: 1, results: [{ id: 1, name: 'test label' }] },
    created_by: { id: 1, username: 'awx', first_name: '', last_name: '' },
    modified_by: { id: 1, username: 'awx', first_name: '', last_name: '' },
    object_roles: {} as Inventory['summary_fields']['object_roles'],
    user_capabilities: { edit: true, delete: true, copy: true, adhoc: true },
  } as Inventory['summary_fields'],
  has_inventory_sources: false,
  pending_deletion: false,
  opa_query_path: '',
  created: '2023-02-08T21:10:41.447053Z',
  modified: '2023-02-08T21:10:41.447067Z',
};

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('/instance_groups/'),
    () => HttpResponse.json(instanceGroupsResponse)
  ),
  http.get(
    ({ request }) => request.url.includes('/input_inventories/'),
    () => HttpResponse.json({ count: 0, results: [] })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderInventoryDetails(inventory: Inventory) {
  return render(
    <MemoryRouter initialEntries={[`/inventories/${inventory.id}`]}>
      <Routes>
        <Route path="/inventories/:id" element={<InventoryDetails inventory={inventory} />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('InventoryDetails', () => {
  it('should render and display regular inventory details', async () => {
    renderInventoryDetails(baseInventory);

    await waitFor(() => {
      expect(screen.getByText('test inventory')).toBeInTheDocument();
    });

    expect(screen.getByText('Default')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Inventory')).toBeInTheDocument();
    expect(screen.getByText('controlplane')).toBeInTheDocument();
    expect(screen.getByText('default')).toBeInTheDocument();
    expect(screen.getByText('Container Group 01')).toBeInTheDocument();
  });

  it('should render smart inventory with type and host filter', async () => {
    const smartInventory: Inventory = {
      ...baseInventory,
      kind: 'smart',
      host_filter: 'name__icontains=test',
    };
    renderInventoryDetails(smartInventory);

    await waitFor(() => {
      expect(screen.getByText('test inventory')).toBeInTheDocument();
    });

    expect(screen.getByText('Smart inventory')).toBeInTheDocument();
    expect(screen.getByText('name__icontains=test')).toBeInTheDocument();
  });

  it('should render constructed inventory with extra fields', async () => {
    const constructedInventory: Inventory = {
      ...baseInventory,
      kind: 'constructed',
      hosts_with_active_failures: 1,
      total_groups: 0,
      total_inventory_sources: 0,
      inventory_sources_with_failures: 0,
      update_cache_timeout: 0,
      verbosity: 0,
      source_vars: '',
      limit: '',
    };
    renderInventoryDetails(constructedInventory);

    await waitFor(() => {
      expect(screen.getByText('test inventory')).toBeInTheDocument();
    });

    expect(screen.getByText('Constructed inventory')).toBeInTheDocument();
    expect(screen.getByText(/0 \(Normal\)/)).toBeInTheDocument();
  });

  it('should render labels', async () => {
    renderInventoryDetails(baseInventory);

    await waitFor(() => {
      expect(screen.getByText('test label')).toBeInTheDocument();
    });
  });

  it('should render policy enforcement when opa_query_path is set', async () => {
    const inventoryWithOpa: Inventory = {
      ...baseInventory,
      opa_query_path: 'data/allow',
    };
    renderInventoryDetails(inventoryWithOpa);

    await waitFor(() => {
      expect(screen.getByText('data/allow')).toBeInTheDocument();
    });
  });

  it('should render prevent instance group fallback option', async () => {
    const inventoryWithFallback: Inventory = {
      ...baseInventory,
      prevent_instance_group_fallback: true,
    };
    renderInventoryDetails(inventoryWithFallback);

    await waitFor(() => {
      expect(screen.getByText('Prevent instance group fallback')).toBeInTheDocument();
    });
  });

  it('should render source variables for constructed inventory', async () => {
    const constructedWithVars: Inventory = {
      ...baseInventory,
      kind: 'constructed',
      source_vars: 'plugin: constructed\nstrict: true',
      verbosity: 1,
      update_cache_timeout: 30,
      limit: 'host1',
      hosts_with_active_failures: 0,
      total_groups: 2,
      total_inventory_sources: 1,
      inventory_sources_with_failures: 0,
    };
    renderInventoryDetails(constructedWithVars);

    await waitFor(() => {
      expect(screen.getByText('Source variables')).toBeInTheDocument();
    });
    expect(screen.getByText('1 (Verbose)')).toBeInTheDocument();
    expect(screen.getByText('host1')).toBeInTheDocument();
  });

  it('should render input inventories for constructed inventory', async () => {
    const constructedInventory: Inventory = {
      ...baseInventory,
      kind: 'constructed',
      hosts_with_active_failures: 0,
      total_groups: 0,
      total_inventory_sources: 0,
      inventory_sources_with_failures: 0,
      update_cache_timeout: 0,
      verbosity: 0,
      source_vars: '',
      limit: '',
    };

    server.use(
      http.get(
        ({ request }) => request.url.includes('/input_inventories/'),
        () =>
          HttpResponse.json({
            count: 1,
            results: [{ id: 5, name: 'Input Inventory A', kind: '' }],
          })
      )
    );

    renderInventoryDetails(constructedInventory);

    await waitFor(() => {
      expect(screen.getByText('Input Inventory A')).toBeInTheDocument();
    });
  });

  it('should render total hosts', async () => {
    renderInventoryDetails(baseInventory);

    await waitFor(() => {
      expect(screen.getByText('test inventory')).toBeInTheDocument();
    });
    expect(screen.getByText('Total hosts')).toBeInTheDocument();
  });

  it('should render Variables label for regular inventory', async () => {
    renderInventoryDetails(baseInventory);

    await waitFor(() => {
      expect(screen.getByText('Variables')).toBeInTheDocument();
    });
  });
});
