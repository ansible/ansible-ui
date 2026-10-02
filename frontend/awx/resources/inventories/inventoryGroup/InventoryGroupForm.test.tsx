import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { CreateGroup, EditGroup, CreateRelatedGroup } from './InventoryGroupForm';

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
  name: 'Demo Inventory',
  type: 'inventory',
  kind: '',
  organization: 1,
  summary_fields: {
    organization: { id: 1, name: 'Default' },
    user_capabilities: {},
  },
};

const mockGroup = {
  id: 433,
  name: 'Related to group 1',
  description: 'This is a description!',
  inventory: 12141,
  variables: '---\ntest: true',
  summary_fields: {
    inventory: { id: 12141, name: 'test invetory', kind: '' },
    user_capabilities: { edit: true, delete: true },
  },
};

const server = setupServer(
  http.get(
    ({ request }) =>
      request.url.includes('/inventories/') &&
      request.url.includes('/1/') &&
      !request.url.includes('/groups/'),
    () => HttpResponse.json(mockInventory)
  ),
  http.get(
    ({ request }) =>
      request.url.includes('/groups/') &&
      request.url.includes('/433') &&
      !request.url.includes('/children/'),
    () => HttpResponse.json(mockGroup)
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('InventoryGroupForm', () => {
  describe('CreateGroup', () => {
    it('should render create new group page', async () => {
      render(
        <MemoryRouter initialEntries={['/inventories/inventory/1/group/add']}>
          <Routes>
            <Route path="/inventories/:inventory_type/:id/group/add" element={<CreateGroup />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('page-title')).toHaveTextContent('Create group');
      });
    });

    it('should render form with name, description, and Submit button', async () => {
      render(
        <MemoryRouter initialEntries={['/inventories/inventory/1/group/add']}>
          <Routes>
            <Route path="/inventories/:inventory_type/:id/group/add" element={<CreateGroup />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('page-title')).toHaveTextContent('Create group');
      });

      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create group/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });
  });

  describe('EditGroup', () => {
    it('should render edit form with group data', async () => {
      render(
        <MemoryRouter initialEntries={['/inventories/inventory/12141/group/433/edit']}>
          <Routes>
            <Route
              path="/inventories/:inventory_type/:id/group/:group_id/edit"
              element={<EditGroup />}
            />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Related to group 1')).toBeInTheDocument();
      });

      expect(screen.getByDisplayValue('This is a description!')).toBeInTheDocument();
    });

    it('should display editable form fields', async () => {
      render(
        <MemoryRouter initialEntries={['/inventories/inventory/12141/group/433/edit']}>
          <Routes>
            <Route
              path="/inventories/:inventory_type/:id/group/:group_id/edit"
              element={<EditGroup />}
            />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Related to group 1')).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /save group/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });
  });

  describe('CreateRelatedGroup', () => {
    it('should render create related group page', async () => {
      render(
        <MemoryRouter initialEntries={['/inventories/inventory/1/group/433/related-groups/add']}>
          <Routes>
            <Route
              path="/inventories/:inventory_type/:id/group/:group_id/related-groups/add"
              element={<CreateRelatedGroup />}
            />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('page-title')).toHaveTextContent('Create group');
      });
    });

    it('should show breadcrumbs including Related Groups', async () => {
      render(
        <MemoryRouter initialEntries={['/inventories/inventory/1/group/433/related-groups/add']}>
          <Routes>
            <Route
              path="/inventories/:inventory_type/:id/group/:group_id/related-groups/add"
              element={<CreateRelatedGroup />}
            />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Related Groups')).toBeInTheDocument();
      });
    });
  });

  describe('EditGroup - breadcrumbs', () => {
    it('should display edit page title with group name', async () => {
      render(
        <MemoryRouter initialEntries={['/inventories/inventory/12141/group/433/edit']}>
          <Routes>
            <Route
              path="/inventories/:inventory_type/:id/group/:group_id/edit"
              element={<EditGroup />}
            />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('page-title')).toHaveTextContent('Edit Related to group 1');
      });
    });
  });
});
