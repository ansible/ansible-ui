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

const inputInventoriesResponse = {
  count: 2,
  next: null,
  previous: null,
  results: [
    { id: 10, name: 'source-inventory-1', type: 'inventory' },
    { id: 11, name: 'source-inventory-2', type: 'inventory' },
  ],
};

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('/instance_groups/'),
    () => HttpResponse.json(instanceGroupsResponse)
  ),
  http.get(
    ({ request }) => request.url.includes('/input_inventories/'),
    () => HttpResponse.json({ count: 0, next: null, previous: null, results: [] })
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

  it('should render input inventory labels for constructed inventory', async () => {
    // Use id: 99 so the SWR cache from the previous constructed-inventory test (id: 9)
    // does not bleed into this one. The page-aware handler ensures that only page=1
    // returns items; pages 2-200 (all fetched by initialSize: 200) return empty.
    server.use(
      http.get(
        ({ request }) => {
          const url = new URL(request.url);
          return (
            url.pathname.includes('/input_inventories/') && url.searchParams.get('page') === '1'
          );
        },
        () => HttpResponse.json(inputInventoriesResponse)
      )
    );

    const constructedInventory: Inventory = {
      ...baseInventory,
      id: 99,
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
    renderInventoryDetails(constructedInventory);

    await waitFor(
      () => {
        expect(screen.getByText('source-inventory-1')).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    expect(screen.getByText('source-inventory-2')).toBeInTheDocument();
  });

  it('should render prevent instance group fallback when flag is set', async () => {
    const inventory: Inventory = { ...baseInventory, prevent_instance_group_fallback: true };
    renderInventoryDetails(inventory);

    await waitFor(() => {
      expect(screen.getByText('test inventory')).toBeInTheDocument();
    });

    expect(screen.getByText('Prevent instance group fallback')).toBeInTheDocument();
  });

  it('should render last job status when inventory source has a last job', async () => {
    // Use id: 77 to avoid SWR cache conflicts with other constructed-inventory tests.
    const inventory = {
      ...baseInventory,
      id: 77,
      kind: 'constructed',
      update_cache_timeout: 0,
      verbosity: 0,
      source_vars: '',
      limit: '',
      source: {
        summary_fields: {
          last_job: { id: 42 },
        },
      },
    } as unknown as Inventory;

    renderInventoryDetails(inventory);

    await waitFor(() => {
      expect(screen.getByText('test inventory')).toBeInTheDocument();
    });

    expect(screen.getByText('Last job status')).toBeInTheDocument();
  });
});
