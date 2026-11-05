import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { usePatchRequest } from '@ansible/common-ui/crud/usePatchRequest';
import { awxAPI } from '../../common/api/awx-utils';
import { CreateRole, EditRole } from './RoleForm';

vi.mock('@ansible/common-ui/crud/usePatchRequest');

const navigateMock = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => navigateMock };
});

const server = setupServer(
  http.options(awxAPI`/role_definitions/`, () =>
    HttpResponse.json({ actions: { POST: {}, GET: {} } })
  ),
  http.get(awxAPI`/role_definitions/1/`, () =>
    HttpResponse.json({
      id: 1,
      name: 'Operator',
      content_type: 'awx.project',
      permissions: [],
    })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
beforeEach(() => {
  navigateMock.mockClear();
  vi.mocked(usePatchRequest).mockReturnValue(
    vi.fn().mockResolvedValue({ id: 1, name: 'Operator' }) as ReturnType<typeof usePatchRequest>
  );
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('RoleForm', () => {
  describe('CreateRole', () => {
    it('should render create role page with title', () => {
      render(
        <MemoryRouter initialEntries={['/roles/create']}>
          <Routes>
            <Route path="/roles/create" element={<CreateRole />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('page-title')).toHaveTextContent('Create role');
    });

    it('should render Name form field', () => {
      render(
        <MemoryRouter initialEntries={['/roles/create']}>
          <Routes>
            <Route path="/roles/create" element={<CreateRole />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('name-form-group')).toBeInTheDocument();
    });

    it('navigates back when cancel is clicked', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter initialEntries={['/roles/create']}>
          <Routes>
            <Route path="/roles/create" element={<CreateRole />} />
          </Routes>
        </MemoryRouter>
      );
      await user.click(screen.getByRole('button', { name: /cancel/i }));
      expect(navigateMock).toHaveBeenCalledWith(-1);
    });
  });

  describe('EditRole', () => {
    it('renders edit role form when role is loaded', async () => {
      render(
        <MemoryRouter initialEntries={['/roles/1/edit']}>
          <Routes>
            <Route path="/roles/:id/edit" element={<EditRole />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('page-title')).toHaveTextContent('Edit Operator');
      });
    });

    it('shows loading breadcrumbs before role loads', () => {
      server.use(http.get(awxAPI`/role_definitions/1/`, () => new Promise(() => {})));
      render(
        <MemoryRouter initialEntries={['/roles/1/edit']}>
          <Routes>
            <Route path="/roles/:id/edit" element={<EditRole />} />
          </Routes>
        </MemoryRouter>
      );
      expect(screen.getByText('Edit Role')).toBeInTheDocument();
    });

    it('navigates back when cancel is clicked on edit', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter initialEntries={['/roles/1/edit']}>
          <Routes>
            <Route path="/roles/:id/edit" element={<EditRole />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('page-title')).toHaveTextContent('Edit Operator');
      });

      await user.click(screen.getByRole('button', { name: /cancel/i }));
      expect(navigateMock).toHaveBeenCalledWith(-1);
    });
  });
});
