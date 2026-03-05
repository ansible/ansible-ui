import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { AddInstance, EditInstance } from './InstanceForm';

const mockInstance = {
  id: 3,
  hostname: 'receptor-1',
  type: 'instance',
  url: '/api/v2/instances/3/',
  node_type: 'execution',
  node_state: 'ready',
  enabled: true,
  managed_by_policy: true,
  listener_port: null,
  peers_from_control_nodes: false,
  summary_fields: {},
};

const server = setupServer(
  http.get(
    ({ request }) =>
      request.url.includes('/instances/3/') && !request.url.includes('/instance_groups/'),
    () => HttpResponse.json(mockInstance)
  ),
  http.patch(
    ({ request }) => request.url.includes('/instances/3/'),
    async ({ request }) => {
      const body = (await request.json()) as Record<string, unknown>;
      return HttpResponse.json({ ...mockInstance, ...body });
    }
  ),
  http.post(
    ({ request }) => request.url.includes('/instances/') && request.method === 'POST',
    async ({ request }) => {
      const body = (await request.json()) as Record<string, unknown>;
      return HttpResponse.json(
        {
          id: 999,
          node_type: body.node_type ?? 'execution',
          node_state: 'installed',
          hostname: body.hostname,
          listener_port: body.listener_port ?? null,
        },
        { status: 201 }
      );
    }
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('InstanceForm', () => {
  describe('AddInstance', () => {
    it('should render create form with correct title', async () => {
      render(
        <MemoryRouter initialEntries={['/instances/add']}>
          <Routes>
            <Route path="/instances/add" element={<AddInstance />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('page-title')).toHaveTextContent('Create instance');
      });
    });

    it('should display key form fields', async () => {
      render(
        <MemoryRouter initialEntries={['/instances/add']}>
          <Routes>
            <Route path="/instances/add" element={<AddInstance />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('page-title')).toHaveTextContent('Create instance');
      });

      expect(screen.getByLabelText(/Host name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Listener port/i)).toBeInTheDocument();
      expect(screen.getByText('Instance type')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Create instance' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('should allow entering hostname', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter initialEntries={['/instances/add']}>
          <Routes>
            <Route path="/instances/add" element={<AddInstance />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/Host name/i)).toBeInTheDocument();
      });

      const hostnameInput = screen.getByLabelText(/Host name/i);
      await user.type(hostnameInput, 'AddInstanceMock');

      expect(hostnameInput).toHaveValue('AddInstanceMock');
    });
  });

  describe('EditInstance', () => {
    it('should render edit form with instance hostname in title', async () => {
      render(
        <MemoryRouter initialEntries={['/instances/3/edit']}>
          <Routes>
            <Route path="/instances/:id/edit" element={<EditInstance />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('page-title')).toHaveTextContent('Edit receptor-1');
      });
    });

    it('should preload form with existing instance data', async () => {
      render(
        <MemoryRouter initialEntries={['/instances/3/edit']}>
          <Routes>
            <Route path="/instances/:id/edit" element={<EditInstance />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('receptor-1')).toBeInTheDocument();
      });
    });

    it('should have hostname disabled in edit mode', async () => {
      render(
        <MemoryRouter initialEntries={['/instances/3/edit']}>
          <Routes>
            <Route path="/instances/:id/edit" element={<EditInstance />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('receptor-1')).toBeInTheDocument();
      });

      const hostnameInput = screen.getByDisplayValue('receptor-1');
      expect(hostnameInput).toBeDisabled();
    });

    it('should display editable fields', async () => {
      render(
        <MemoryRouter initialEntries={['/instances/3/edit']}>
          <Routes>
            <Route path="/instances/:id/edit" element={<EditInstance />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('page-title')).toHaveTextContent('Edit receptor-1');
      });

      expect(screen.getByRole('button', { name: 'Save instance' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });
  });
});
