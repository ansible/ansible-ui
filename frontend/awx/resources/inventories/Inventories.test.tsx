import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { Inventories } from './Inventories';

const mockInventories = {
  count: 2,
  next: null,
  previous: null,
  results: [
    {
      id: 1,
      type: 'inventory',
      name: 'Demo Inventory',
      kind: '',
      description: 'Demo inventory',
      has_inventory_sources: false,
      summary_fields: {
        user_capabilities: { edit: true, delete: true, copy: true },
        organization: { id: 1, name: 'Default' },
      },
    },
    {
      id: 2,
      type: 'inventory',
      name: 'Test Inventory',
      kind: '',
      description: 'Test inventory',
      has_inventory_sources: true,
      summary_fields: {
        user_capabilities: { edit: true, delete: true, copy: false },
        organization: { id: 1, name: 'Default' },
      },
    },
  ],
};

const server = setupServer(
  http.options(awxAPI`/inventories/`, () => {
    return HttpResponse.json({
      actions: {},
    });
  }),
  http.get(awxAPI`/inventories/`, () => {
    return HttpResponse.json(mockInventories);
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Inventories', () => {
  it('should render inventories list', async () => {
    render(
      <MemoryRouter>
        <Inventories />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Inventories')).toBeInTheDocument();
    });
  });

  it('should show empty state when no inventories exist', async () => {
    server.use(
      http.get(awxAPI`/inventories/`, () => HttpResponse.json({ count: 0, results: [] })),
      http.options(awxAPI`/inventories/`, () =>
        HttpResponse.json({ actions: { POST: {}, GET: {} } })
      )
    );
    render(
      <MemoryRouter>
        <Inventories />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/There are currently no inventories added/i)).toBeInTheDocument();
    });
  });

  it('should display inventories in table', async () => {
    render(
      <MemoryRouter>
        <Inventories />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Demo Inventory')).toBeInTheDocument();
      expect(screen.getByText('Test Inventory')).toBeInTheDocument();
    });
  });
});
