import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { GroupEdit } from './GroupEdit';

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

const mockGroup = {
  id: 1,
  name: 'Test Group',
  description: 'Test description',
  inventory: 42,
  variables: '---\n',
  summary_fields: {
    inventory: { id: 42, name: 'Demo Inventory' },
    user_capabilities: {},
  },
};

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('/groups/') && request.url.includes('/1/'),
    () => HttpResponse.json(mockGroup)
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('GroupEdit', () => {
  it('should render edit form with Save group button', async () => {
    render(
      <MemoryRouter initialEntries={['/inventories/inventory/42/group/1/edit']}>
        <Routes>
          <Route
            path="/inventories/:inventory_type/:id/group/:group_id/edit"
            element={<GroupEdit />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save group/i })).toBeInTheDocument();
    });
  });

  it('should populate name field from API data', async () => {
    render(
      <MemoryRouter initialEntries={['/inventories/inventory/42/group/1/edit']}>
        <Routes>
          <Route
            path="/inventories/:inventory_type/:id/group/:group_id/edit"
            element={<GroupEdit />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Group')).toBeInTheDocument();
    });
  });

  it('should populate description field from API data', async () => {
    render(
      <MemoryRouter initialEntries={['/inventories/inventory/42/group/1/edit']}>
        <Routes>
          <Route
            path="/inventories/:inventory_type/:id/group/:group_id/edit"
            element={<GroupEdit />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();
    });
  });

  it('should display Cancel button', async () => {
    render(
      <MemoryRouter initialEntries={['/inventories/inventory/42/group/1/edit']}>
        <Routes>
          <Route
            path="/inventories/:inventory_type/:id/group/:group_id/edit"
            element={<GroupEdit />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });
  });
});
