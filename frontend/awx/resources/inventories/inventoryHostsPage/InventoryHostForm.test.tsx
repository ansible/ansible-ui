import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import type { IHostInput } from './InventoryHostForm';
import { CreateHost, EditHost } from './InventoryHostForm';

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

const mockInventory = {
  id: 1,
  name: 'Default',
  kind: '',
  organization: 1,
  summary_fields: {
    organization: { id: 1, name: 'Default' },
    user_capabilities: {},
  },
};

const mockInventories = {
  count: 1,
  next: null,
  previous: null,
  results: [mockInventory],
};

const mockHost = {
  id: 435,
  name: 'test',
  description: 'mock host description',
  inventory: 1,
  enabled: true,
  variables: 'hello: world',
  created: '2024-01-01T00:00:00Z',
  modified: '2024-01-01T00:00:00Z',
  summary_fields: {
    inventory: { id: 1, name: 'test inventory', kind: '' },
    created_by: { id: 1, username: 'admin' },
    modified_by: { id: 1, username: 'admin' },
    recent_jobs: [],
    groups: { count: 0, results: [] },
    user_capabilities: { edit: true, delete: true },
  },
};

const server = setupServer(
  http.get(
    ({ request }) =>
      request.url.includes('/inventories/') &&
      request.url.includes('/1/') &&
      !request.url.includes('inventory_sources'),
    () => HttpResponse.json(mockInventory)
  ),
  http.get(
    ({ request }) => request.url.includes('/inventories/') && !request.url.includes('/1/'),
    () => HttpResponse.json(mockInventories)
  ),
  http.get(
    ({ request }) => request.url.includes('/hosts/435/'),
    () => HttpResponse.json(mockHost)
  ),
  http.post(awxAPI`/hosts/`, async ({ request }) => {
    const body = (await request.json()) as IHostInput;
    return HttpResponse.json(
      {
        id: 999,
        name: body.name ?? 'test',
        description: body.description,
        variables: body.variables,
        inventory: body.inventory ?? 1,
        enabled: body.enabled ?? true,
      },
      { status: 201 }
    );
  }),
  http.patch(awxAPI`/hosts/435/`, async ({ request }) => {
    const body = (await request.json()) as IHostInput;
    return HttpResponse.json({
      ...mockHost,
      name: body.name ?? mockHost.name,
      description: body.description ?? mockHost.description,
    });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderCreateHost(initialEntries: string[], path: string) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path={path} element={<CreateHost />} />
      </Routes>
    </MemoryRouter>
  );
}

function renderEditHost(initialEntries: string[], path: string) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path={path} element={<EditHost />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('InventoryHostForm', () => {
  describe('CreateHost', () => {
    it('should render create form for inventory host', async () => {
      renderCreateHost(['/inventories/inventory/1/add'], '/inventories/:inventory_type/:id/add');

      await waitFor(() => {
        expect(screen.getByTestId('page-title')).toHaveTextContent('Create host');
      });

      expect(screen.getByRole('textbox', { name: /name/i })).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter host name')).toBeInTheDocument();
    });

    it('should have required validation on name field', async () => {
      renderCreateHost(['/inventories/inventory/1/add'], '/inventories/:inventory_type/:id/add');

      await waitFor(() => {
        expect(screen.getByTestId('page-title')).toHaveTextContent('Create host');
      });

      const nameFormGroup = screen.getByTestId('name-form-group');
      expect(nameFormGroup.querySelector('.pf-v6-c-form__label-required')).toBeInTheDocument();
    });

    it('should create host with correct payload for inventory host', async () => {
      const user = userEvent.setup();
      let capturedBody: unknown = null;
      server.use(
        http.post(awxAPI`/hosts/`, async ({ request }) => {
          capturedBody = await request.json();
          return HttpResponse.json(
            {
              id: 999,
              name: 'test',
              description: 'mock host description',
              inventory: 1,
              enabled: true,
              variables: 'hello: world',
            },
            { status: 201 }
          );
        })
      );

      renderCreateHost(['/inventories/inventory/1/add'], '/inventories/:inventory_type/:id/add');

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter host name')).toBeInTheDocument();
      });

      await user.type(screen.getByPlaceholderText('Enter host name'), 'test');
      await user.type(screen.getByPlaceholderText('Enter description'), 'mock host description');

      const variablesInput = screen.getByTestId('variables');
      if (variablesInput) {
        await user.clear(variablesInput);
        await user.type(variablesInput, 'hello: world');
      }

      await user.click(screen.getByTestId('Submit'));

      await waitFor(() => {
        expect(capturedBody).toMatchObject({
          name: 'test',
          description: 'mock host description',
          inventory: 1,
          enabled: true,
        });
      });
    });

    it('should render create form for standalone host', async () => {
      renderCreateHost(['/hosts/create'], '/hosts/create');

      await waitFor(() => {
        expect(screen.getByTestId('page-title')).toHaveTextContent('Create host');
      });

      expect(screen.getByRole('textbox', { name: /name/i })).toBeInTheDocument();
      expect(screen.getByText('Inventory')).toBeInTheDocument();
    });
  });

  describe('EditHost', () => {
    it('should preload form with host data for inventory host', async () => {
      renderEditHost(
        ['/inventories/inventory/1/host/435/edit'],
        '/inventories/:inventory_type/:id/host/:host_id/edit'
      );

      await waitFor(() => {
        expect(screen.getByTestId('name')).toHaveValue('test');
      });

      expect(screen.getByTestId('description')).toHaveValue('mock host description');
    });

    it('should preload form with host data for standalone host', async () => {
      renderEditHost(['/hosts/435/edit'], '/hosts/:id/edit');

      await waitFor(() => {
        expect(screen.getByTestId('name')).toHaveValue('test');
      });

      expect(screen.getByTestId('description')).toHaveValue('mock host description');
      expect(screen.getByTestId('inventory-name')).toHaveValue('test inventory');
    });

    it('should have required validation on name field in edit mode', async () => {
      renderEditHost(
        ['/inventories/inventory/1/host/435/edit'],
        '/inventories/:inventory_type/:id/host/:host_id/edit'
      );

      await waitFor(() => {
        expect(screen.getByTestId('name')).toHaveValue('test');
      });

      const nameFormGroup = screen.getByTestId('name-form-group');
      expect(nameFormGroup.querySelector('.pf-v6-c-form__label-required')).toBeInTheDocument();
    });

    it('should send correct request body when editing host', async () => {
      const user = userEvent.setup();
      let capturedBody: unknown = null;
      server.use(
        http.patch(awxAPI`/hosts/435/`, async ({ request }) => {
          capturedBody = await request.json();
          return HttpResponse.json({
            ...mockHost,
            name: 'Edited Host',
            description: 'Edited Descriptions',
          });
        })
      );

      renderEditHost(
        ['/inventories/inventory/1/host/435/edit'],
        '/inventories/:inventory_type/:id/host/:host_id/edit'
      );

      await waitFor(() => {
        expect(screen.getByTestId('name')).toHaveValue('test');
      });

      await user.clear(screen.getByTestId('name'));
      await user.type(screen.getByTestId('name'), 'Edited Host');
      await user.clear(screen.getByTestId('description'));
      await user.type(screen.getByTestId('description'), 'Edited Descriptions');
      await user.click(screen.getByTestId('Submit'));

      await waitFor(() => {
        expect(capturedBody).toMatchObject({
          name: 'Edited Host',
          description: 'Edited Descriptions',
        });
      });
    });
  });

  describe('IHostInput', () => {
    it('should support required and optional fields', () => {
      const hostInput: IHostInput = {
        name: 'test-host',
        description: 'Test description',
        variables: '---\nkey: value',
        inventory: { id: 1, name: 'Default' },
        enabled: true,
      };
      expect(hostInput.name).toBe('test-host');
      expect(hostInput.description).toBe('Test description');
      expect(hostInput.enabled).toBe(true);
    });
  });
});
