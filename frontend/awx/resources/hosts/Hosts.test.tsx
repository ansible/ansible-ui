import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { awxAPI } from '../../common/api/awx-utils';
import { AwxItemsResponse } from '../../common/AwxItemsResponse';
import { AwxHost } from '../../interfaces/AwxHost';
import { Hosts } from './Hosts';
import { InventoryHosts } from '../inventories/InventoryPage/InventoryHosts';
import mockHosts from './fixtures/hosts.fixture.json';
import mockHostsOptions from './fixtures/hostsOptions.fixture.json';
import mockInventory from './fixtures/inventory.fixture.json';

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Hosts - Standalone Route', () => {
  beforeEach(() => {
    server.use(
      http.get(awxAPI`/hosts/`, () => HttpResponse.json(mockHosts)),
      http.options(awxAPI`/hosts/`, () => HttpResponse.json(mockHostsOptions))
    );
  });

  test('should render with correct API endpoint and row count', async () => {
    render(
      <MemoryRouter initialEntries={['/hosts']}>
        <Hosts />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Hosts' })).toBeInTheDocument();

    await waitFor(() => {
      const table = screen.getByRole('grid');
      const tbody = table.querySelector('tbody');
      const dataRows = within(tbody as HTMLElement).getAllByRole('row');
      expect(dataRows).toHaveLength(mockHosts.count);
    });
  });

  test('should display standalone empty state with create button when user has permission', async () => {
    server.use(
      http.get(awxAPI`/hosts/`, () => HttpResponse.json({ count: 0, results: [] })),
      http.options(awxAPI`/hosts/`, () => HttpResponse.json(mockHostsOptions))
    );

    render(
      <MemoryRouter initialEntries={['/hosts']}>
        <Hosts />
      </MemoryRouter>
    );

    expect(await screen.findByText(/there are currently no hosts added/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /create host/i })).toBeInTheDocument();
  });

  test('should display standalone empty state without create button when user lacks permission', async () => {
    server.use(
      http.get(awxAPI`/hosts/`, () => HttpResponse.json({ count: 0, results: [] })),
      http.options(awxAPI`/hosts/`, () => {
        return HttpResponse.json({
          ...mockHostsOptions,
          actions: { GET: mockHostsOptions.actions.GET },
        });
      })
    );

    render(
      <MemoryRouter initialEntries={['/hosts']}>
        <Hosts />
      </MemoryRouter>
    );

    expect(
      await screen.findByText(/you do not have permission to create a host/i)
    ).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /create host/i })).not.toBeInTheDocument();
  });
});

describe('InventoryHosts - Regular Inventory Route', () => {
  beforeEach(() => {
    server.use(
      http.get(awxAPI`/inventories/1/`, () => HttpResponse.json(mockInventory)),
      http.get(awxAPI`/inventories/1/hosts/`, () => HttpResponse.json(mockHosts)),
      http.options(awxAPI`/hosts/`, () => HttpResponse.json(mockHostsOptions)),
      http.options(awxAPI`/inventories/1/ad_hoc_commands/`, () =>
        HttpResponse.json({ actions: { POST: {} } })
      )
    );
  });

  test('should render with inventory-scoped API endpoint', async () => {
    render(
      <MemoryRouter initialEntries={['/inventories/inventory/1/hosts']}>
        <Routes>
          <Route path="/inventories/:inventory_type/:id/hosts" element={<InventoryHosts />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      const table = screen.getByRole('grid');
      const tbody = table.querySelector('tbody');
      const dataRows = within(tbody as HTMLElement).getAllByRole('row');
      expect(dataRows).toHaveLength(mockHosts.count);
    });
  });

  test('should display inventory-specific empty state with create button', async () => {
    server.use(
      http.get(awxAPI`/inventories/1/hosts/`, () => HttpResponse.json({ count: 0, results: [] }))
    );

    render(
      <MemoryRouter initialEntries={['/inventories/inventory/1/hosts']}>
        <Routes>
          <Route path="/inventories/:inventory_type/:id/hosts" element={<InventoryHosts />} />
        </Routes>
      </MemoryRouter>
    );

    expect(
      await screen.findByText(/there are currently no hosts added to this inventory/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /create host/i })).toBeInTheDocument();
  });

  test('should display inventory-specific empty state without create button when user lacks permission', async () => {
    server.use(
      http.get(awxAPI`/inventories/1/hosts/`, () => HttpResponse.json({ count: 0, results: [] })),
      http.options(awxAPI`/hosts/`, () => {
        return HttpResponse.json({
          ...mockHostsOptions,
          actions: { GET: mockHostsOptions.actions.GET },
        });
      })
    );

    render(
      <MemoryRouter initialEntries={['/inventories/inventory/1/hosts']}>
        <Routes>
          <Route path="/inventories/:inventory_type/:id/hosts" element={<InventoryHosts />} />
        </Routes>
      </MemoryRouter>
    );

    expect(
      await screen.findByText(/you do not have permission to create a host/i)
    ).toBeInTheDocument();
  });
});

describe.each([
  { inventory_type: 'smart_inventory', description: 'Smart Inventory' },
  { inventory_type: 'constructed_inventory', description: 'Constructed Inventory' },
])('$description Hosts - Read-only Route', ({ inventory_type }) => {
  beforeEach(() => {
    server.use(
      http.get(awxAPI`/inventories/1/`, () => HttpResponse.json(mockInventory)),
      http.get(awxAPI`/inventories/1/hosts/`, () => HttpResponse.json(mockHosts)),
      http.options(awxAPI`/hosts/`, () => HttpResponse.json(mockHostsOptions)),
      http.options(awxAPI`/inventories/1/ad_hoc_commands/`, () =>
        HttpResponse.json({ actions: { POST: {} } })
      )
    );
  });

  test('should not have create or edit actions, only run command', async () => {
    render(
      <MemoryRouter initialEntries={[`/inventories/${inventory_type}/1/hosts`]}>
        <Routes>
          <Route path="/inventories/:inventory_type/:id/hosts" element={<InventoryHosts />} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByText('localhost');

    expect(screen.queryByRole('button', { name: /edit host/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /create host/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /create host/i })).not.toBeInTheDocument();

    const runCommandButton = screen.getByRole('button', { name: /run command/i });
    expect(runCommandButton).toBeInTheDocument();
  });

  test('should have filters for Name, Created By and Modified By (no Description filter)', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={[`/inventories/${inventory_type}/1/hosts`]}>
        <Routes>
          <Route path="/inventories/:inventory_type/:id/hosts" element={<InventoryHosts />} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByText('localhost');

    const filterDropdown = screen.getByTestId('page-toolbar').querySelector('#filter');
    expect(filterDropdown).toBeInTheDocument();
    await user.click(filterDropdown!);

    const filterMenu = await screen.findByRole('listbox');
    expect(within(filterMenu).getByText(/^Name$/)).toBeInTheDocument();
    expect(within(filterMenu).getByText(/^Created by$/)).toBeInTheDocument();
    expect(within(filterMenu).getByText(/^Modified by$/)).toBeInTheDocument();
  });

  test('should display read-only empty state', async () => {
    server.use(
      http.get(awxAPI`/inventories/1/hosts/`, () => HttpResponse.json({ count: 0, results: [] }))
    );

    render(
      <MemoryRouter initialEntries={[`/inventories/${inventory_type}/1/hosts`]}>
        <Routes>
          <Route path="/inventories/:inventory_type/:id/hosts" element={<InventoryHosts />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText(/no hosts found/i)).toBeInTheDocument();
    expect(screen.getByText(/please add hosts to populate this list/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /create host/i })).not.toBeInTheDocument();
  });
});

describe('Permission-based UI Behavior', () => {
  beforeEach(() => {
    server.use(
      http.get(awxAPI`/inventories/1/`, () => HttpResponse.json(mockInventory)),
      http.options(awxAPI`/hosts/`, () => HttpResponse.json(mockHostsOptions))
    );
  });

  test('should have filters for Name, Description, Created By and Modified By', async () => {
    server.use(http.get(awxAPI`/hosts/`, () => HttpResponse.json(mockHosts)));

    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/hosts']}>
        <Hosts />
      </MemoryRouter>
    );

    await waitFor(() => {
      const table = screen.getByRole('grid');
      const tbody = table.querySelector('tbody');
      const dataRows = within(tbody as HTMLElement).getAllByRole('row');
      expect(dataRows).toHaveLength(mockHosts.count);
    });

    const filterDropdown = screen.getByTestId('page-toolbar').querySelector('#filter');
    expect(filterDropdown).toBeInTheDocument();
    await user.click(filterDropdown!);

    const filterMenu = await screen.findByRole('listbox');
    expect(within(filterMenu).getByText(/^Name$/)).toBeInTheDocument();
    expect(within(filterMenu).getByText(/^Description$/)).toBeInTheDocument();
    expect(within(filterMenu).getByText(/^Created by$/)).toBeInTheDocument();
    expect(within(filterMenu).getByText(/^Modified by$/)).toBeInTheDocument();
  });

  test('should disable create button when user lacks POST permission', async () => {
    server.use(
      http.get(awxAPI`/hosts/`, () => HttpResponse.json(mockHosts)),
      http.options(awxAPI`/hosts/`, () => {
        return HttpResponse.json({
          ...mockHostsOptions,
          actions: { GET: mockHostsOptions.actions.GET },
        });
      })
    );

    render(
      <MemoryRouter initialEntries={['/hosts']}>
        <Hosts />
      </MemoryRouter>
    );

    const createButton = await screen.findByRole('button', { name: /create host/i });
    expect(createButton).toHaveAttribute('aria-disabled', 'true');
  });

  test('should disable edit button when host lacks edit capability', async () => {
    const hostsWithoutEditPermission: AwxItemsResponse<AwxHost> = {
      count: 1,
      results: [
        {
          ...(mockHosts.results[0] as unknown as AwxHost),
          name: 'test-host',
          summary_fields: {
            ...mockHosts.results[0].summary_fields,
            user_capabilities: { edit: false, delete: true },
          },
        } as AwxHost,
      ],
    };

    server.use(http.get(awxAPI`/hosts/`, () => HttpResponse.json(hostsWithoutEditPermission)));

    render(
      <MemoryRouter initialEntries={['/hosts']}>
        <Hosts />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('test-host')).toBeInTheDocument();
    });

    const row = screen.getByText('test-host').closest('tr');
    expect(row).toBeInTheDocument();

    const editButton = within(row as HTMLElement).getByRole('button', { name: /edit host/i });
    expect(editButton).toHaveAttribute('aria-disabled', 'true');
  });

  test('should disable delete action when host lacks delete capability', async () => {
    const user = userEvent.setup();
    const hostsWithoutDeletePermission: AwxItemsResponse<AwxHost> = {
      count: 1,
      results: [
        {
          ...(mockHosts.results[0] as unknown as AwxHost),
          name: 'test-host',
          summary_fields: {
            ...mockHosts.results[0].summary_fields,
            user_capabilities: { edit: true, delete: false },
          },
        } as AwxHost,
      ],
    };

    server.use(http.get(awxAPI`/hosts/`, () => HttpResponse.json(hostsWithoutDeletePermission)));

    render(
      <MemoryRouter initialEntries={['/hosts']}>
        <Hosts />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('test-host')).toBeInTheDocument();
    });

    const row = screen.getByText('test-host').closest('tr');
    expect(row).toBeInTheDocument();

    const kebabButton = (row as HTMLElement).querySelector(
      'button[aria-label="kebab dropdown toggle"]'
    );
    expect(kebabButton).toBeInTheDocument();
    await user.click(kebabButton as HTMLElement);

    const deleteMenuItem = await screen.findByRole('menuitem', { name: /delete host/i });
    expect(deleteMenuItem).toHaveAttribute('aria-disabled', 'true');
  });
});
