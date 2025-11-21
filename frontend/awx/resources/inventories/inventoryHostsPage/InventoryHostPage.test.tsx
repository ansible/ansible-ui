import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { AwxHost } from '../../../interfaces/AwxHost';
import { Inventory } from '../../../interfaces/Inventory';
import { InventoryHostPage } from './InventoryHostPage';

const mockHost: AwxHost = {
  id: 1,
  type: 'host',
  url: '/api/v2/hosts/1/',
  name: 'Test Host',
  description: 'Test host description',
  inventory: 1,
  enabled: true,
  instance_id: '',
  variables: '',
  has_active_failures: 'false',
  has_inventory_sources: 'false',
  last_job: undefined,
  last_job_host_summary: undefined,
  ansible_facts_modified: undefined,
  created: '2024-01-01T00:00:00Z',
  modified: '2024-01-01T00:00:00Z',
  summary_fields: {
    inventory: {
      id: 1,
      name: 'Test Inventory',
      kind: '',
    },
    recent_jobs: [],
    groups: {
      count: 0,
      results: [],
    },
    user_capabilities: {
      edit: true,
      delete: true,
    },
    created_by: {
      id: 1,
      username: 'admin',
    },
    modified_by: {
      id: 1,
      username: 'admin',
    },
  },
};

const mockInventory: Inventory = {
  id: 1,
  type: 'inventory',
  url: '/api/v2/inventories/1/',
  name: 'Test Inventory',
  description: '',
  organization: 1,
  kind: '',
  host_filter: null,
  variables: '',
  has_active_failures: false,
  total_hosts: 1,
  hosts_with_active_failures: 0,
  total_groups: 0,
  has_inventory_sources: false,
  total_inventory_sources: 0,
  inventory_sources_with_failures: 0,
  pending_deletion: false,
  created: '2024-01-01T00:00:00Z',
  modified: '2024-01-01T00:00:00Z',
  opa_query_path: '',
  summary_fields: {
    organization: {
      id: 1,
      name: 'Default',
      description: '',
    },
    created_by: {
      id: 1,
      username: 'admin',
      first_name: 'Admin',
      last_name: 'User',
    },
    modified_by: {
      id: 1,
      username: 'admin',
      first_name: 'Admin',
      last_name: 'User',
    },
    object_roles: {
      admin_role: {
        id: 1,
        name: 'Admin',
        description: 'Admin role',
      },
      update_role: {
        id: 2,
        name: 'Update',
        description: 'Update role',
      },
      adhoc_role: {
        id: 3,
        name: 'Adhoc',
        description: 'Adhoc role',
      },
      use_role: {
        id: 4,
        name: 'Use',
        description: 'Use role',
      },
      read_role: {
        id: 5,
        name: 'Read',
        description: 'Read role',
      },
    },
    user_capabilities: {
      edit: true,
      delete: true,
      copy: true,
      adhoc: true,
    },
    labels: {
      count: 0,
      results: [],
    },
  },
};

vi.mock('../../hosts/hooks/useGetHost', () => ({
  useGetHost: vi.fn(() => ({
    host: mockHost,
    refresh: vi.fn(),
  })),
}));

vi.mock('../InventoryPage/InventoryPage', () => ({
  useGetInventory: vi.fn(() => mockInventory),
}));

describe('InventoryHostPage Tab Rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders all tabs (Details, Facts, Groups, Jobs) for regular inventory', async () => {
    render(
      <MemoryRouter initialEntries={['/inventories/1/inventory/hosts/1/details']}>
        <Routes>
          <Route
            path="/inventories/:id/:inventory_type/hosts/:host_id/details"
            element={<InventoryHostPage />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Details' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Facts' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Groups' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Jobs' })).toBeInTheDocument();
    });
  });

  test('renders only Details tab for smart_inventory', async () => {
    render(
      <MemoryRouter initialEntries={['/inventories/1/smart_inventory/hosts/1/details']}>
        <Routes>
          <Route
            path="/inventories/:id/:inventory_type/hosts/:host_id/details"
            element={<InventoryHostPage />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Details' })).toBeInTheDocument();
      expect(screen.queryByRole('tab', { name: 'Facts' })).not.toBeInTheDocument();
      expect(screen.queryByRole('tab', { name: 'Groups' })).not.toBeInTheDocument();
      expect(screen.queryByRole('tab', { name: 'Jobs' })).not.toBeInTheDocument();
    });
  });

  test('renders only Details tab for constructed_inventory', async () => {
    render(
      <MemoryRouter initialEntries={['/inventories/1/constructed_inventory/hosts/1/details']}>
        <Routes>
          <Route
            path="/inventories/:id/:inventory_type/hosts/:host_id/details"
            element={<InventoryHostPage />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Details' })).toBeInTheDocument();
      expect(screen.queryByRole('tab', { name: 'Facts' })).not.toBeInTheDocument();
      expect(screen.queryByRole('tab', { name: 'Groups' })).not.toBeInTheDocument();
      expect(screen.queryByRole('tab', { name: 'Jobs' })).not.toBeInTheDocument();
    });
  });
});
