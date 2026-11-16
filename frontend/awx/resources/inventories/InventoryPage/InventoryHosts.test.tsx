import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import { InventoryHosts } from './InventoryHosts';

// Node may expose experimental localStorage as unavailable; mock for useView perPage.
globalThis.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
} as Storage;

const mockHostOptionsWithPost = {
  actions: {
    POST: {
      name: { type: 'string', required: true },
      description: { type: 'string', required: false },
    },
  },
};

const mockHostOptionsWithoutPost = {
  actions: {
    GET: {},
  },
};

const mockEmptyHostsResponse = {
  count: 0,
  next: null,
  previous: null,
  results: [],
};

const mockHostsResponse = {
  count: 2,
  next: null,
  previous: null,
  results: [
    {
      id: 1,
      name: 'constructed-host-1',
      description: '',
      enabled: true,
      inventory: 1,
      created: '2025-01-01T00:00:00.000000Z',
      modified: '2025-01-01T00:00:00.000000Z',
      summary_fields: {
        inventory: { id: 1, name: 'Constructed', kind: 'constructed', description: '' },
        user_capabilities: { edit: false, delete: false },
      },
    },
    {
      id: 2,
      name: 'constructed-host-2',
      description: '',
      enabled: true,
      inventory: 1,
      created: '2025-01-01T00:00:00.000000Z',
      modified: '2025-01-01T00:00:00.000000Z',
      summary_fields: {
        inventory: { id: 1, name: 'Constructed', kind: 'constructed', description: '' },
        user_capabilities: { edit: false, delete: false },
      },
    },
  ],
};

function renderInventoryHosts(inventoryType: string) {
  return render(
    <MemoryRouter initialEntries={[`/inventories/1/${inventoryType}/hosts`]}>
      <Routes>
        <Route path="/inventories/:id/:inventory_type/hosts" element={<InventoryHosts />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('InventoryHosts Component Button Visibility', () => {
  const server = setupServer(
    http.options(awxAPI`/hosts/`, () => {
      return HttpResponse.json(mockHostOptionsWithPost);
    }),
    http.get(awxAPI`/inventories/:id/hosts/`, () => {
      return HttpResponse.json(mockEmptyHostsResponse);
    }),
    http.options(awxAPI`/inventories/:id/ad_hoc_commands/`, () => {
      return HttpResponse.json({ actions: { POST: {} } });
    })
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test('should show Create host button for regular inventory with POST permission', async () => {
    renderInventoryHosts('inventory');

    await waitFor(() => {
      expect(screen.getByText('No hosts are assigned to this inventory.')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Create host/i })).toBeInTheDocument();
    });
  });

  test('should not show Create host button for smart_inventory', async () => {
    renderInventoryHosts('smart_inventory');

    await waitFor(() => {
      expect(screen.getByText('No hosts found')).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /Create host/i })).not.toBeInTheDocument();
    });
  });

  test('should not show Create host button for constructed_inventory', async () => {
    renderInventoryHosts('constructed_inventory');

    await waitFor(() => {
      expect(screen.getByText('No hosts found')).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /Create host/i })).not.toBeInTheDocument();
    });
  });

  test('should not show Create host button when lacking POST permission', async () => {
    server.use(
      http.options(awxAPI`/hosts/`, () => {
        return HttpResponse.json(mockHostOptionsWithoutPost);
      })
    );

    renderInventoryHosts('inventory');

    await waitFor(() => {
      expect(screen.getByText('You do not have permission to create a host.')).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /Create host/i })).not.toBeInTheDocument();
    });
  });

  test('should show host selection checkboxes for constructed_inventory (AAP-93628)', async () => {
    server.use(
      http.get(awxAPI`/inventories/:id/hosts/`, () => {
        return HttpResponse.json(mockHostsResponse);
      })
    );

    renderInventoryHosts('constructed_inventory');

    await waitFor(() => {
      expect(screen.getByText('constructed-host-1')).toBeInTheDocument();
    });

    expect(screen.getByTestId('selections-column-header')).toBeInTheDocument();
    expect(screen.getAllByTestId('checkbox-column-cell')).toHaveLength(2);
  });
});
