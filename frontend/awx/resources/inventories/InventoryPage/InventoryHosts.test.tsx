import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import { InventoryHosts } from './InventoryHosts';

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

describe('InventoryHosts Component Button Visibility', () => {
  const server = setupServer(
    http.options(awxAPI`/hosts/`, () => {
      return HttpResponse.json(mockHostOptionsWithPost);
    }),
    http.get(awxAPI`/inventories/:id/hosts/`, () => {
      return HttpResponse.json(mockEmptyHostsResponse);
    }),
    http.options(awxAPI`/inventories/:id/ad_hoc_commands/`, () => {
      return HttpResponse.json({});
    })
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test('should show Create host button for regular inventory with POST permission', async () => {
    render(
      <MemoryRouter initialEntries={['/inventories/1/inventory/hosts']}>
        <Routes>
          <Route path="/inventories/:id/:inventory_type/hosts" element={<InventoryHosts />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No hosts are assigned to this inventory.')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Create host/i })).toBeInTheDocument();
    });
  });

  test('should not show Create host button for smart_inventory', async () => {
    render(
      <MemoryRouter initialEntries={['/inventories/1/smart_inventory/hosts']}>
        <Routes>
          <Route path="/inventories/:id/:inventory_type/hosts" element={<InventoryHosts />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No hosts found')).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /Create host/i })).not.toBeInTheDocument();
    });
  });

  test('should not show Create host button for constructed_inventory', async () => {
    render(
      <MemoryRouter initialEntries={['/inventories/1/constructed_inventory/hosts']}>
        <Routes>
          <Route path="/inventories/:id/:inventory_type/hosts" element={<InventoryHosts />} />
        </Routes>
      </MemoryRouter>
    );

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

    render(
      <MemoryRouter initialEntries={['/inventories/1/inventory/hosts']}>
        <Routes>
          <Route path="/inventories/:id/:inventory_type/hosts" element={<InventoryHosts />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('You do not have permission to create a host.')).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /Create host/i })).not.toBeInTheDocument();
    });
  });
});
