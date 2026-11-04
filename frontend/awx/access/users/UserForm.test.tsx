import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { CreateUser, EditUser } from './UserForm';

vi.mock('@ansible/common-ui/crud/usePostRequest');
vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  return {
    ...actual,
    usePageNavigate: () => vi.fn(),
  };
});

const mockOrganizations = {
  count: 1,
  next: null,
  previous: null,
  results: [{ id: 1, name: 'Default', type: 'organization' }],
};

const server = setupServer(
  http.options(
    ({ request }) => request.url.includes('/users/'),
    () => HttpResponse.json({ actions: { POST: {} } })
  ),
  http.options(
    ({ request }) => request.url.includes('/organizations/'),
    () => HttpResponse.json({ actions: { GET: {}, POST: {} } })
  ),
  http.get(
    ({ request }) => request.url.includes('/organizations/') && !request.url.includes('/1/users/'),
    () => HttpResponse.json(mockOrganizations)
  ),
  http.get(
    ({ request }) => request.url.includes('/users/1/') && !request.url.includes('roles'),
    () =>
      HttpResponse.json({
        id: 1,
        username: 'edituser',
        first_name: '',
        last_name: '',
        email: '',
        is_superuser: false,
        is_system_auditor: false,
      })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.mocked(usePostRequest).mockReturnValue(
    vi.fn().mockResolvedValue({ id: 99, username: 'newuser' }) as ReturnType<typeof usePostRequest>
  );
});
afterEach(() => {
  act(() => {
    vi.runAllTimers();
  });
  vi.useRealTimers();
  server.resetHandlers();
});
afterAll(() => server.close());

describe('UserForm', () => {
  describe('CreateUser', () => {
    it('should render create user page with title', async () => {
      render(
        <MemoryRouter initialEntries={['/users/create']}>
          <Routes>
            <Route path="/users/create" element={<CreateUser />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('page-title')).toHaveTextContent('Create user');
      });
    });

    it('should render Username form field', async () => {
      render(
        <MemoryRouter initialEntries={['/users/create']}>
          <Routes>
            <Route path="/users/create" element={<CreateUser />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('username-form-group')).toBeInTheDocument();
      });
    });

    it('shows validation error for invalid username characters', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) });
      render(
        <MemoryRouter initialEntries={['/users/create']}>
          <Routes>
            <Route path="/users/create" element={<CreateUser />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: /username/i })).toBeInTheDocument();
      });

      await user.type(screen.getByRole('textbox', { name: /username/i }), 'bad#name');
      await user.click(screen.getByTestId('Submit'));

      await waitFor(() => {
        expect(screen.getByText(/Username may contain only letters/)).toBeInTheDocument();
      });
    });

    it.skip('submits create user when passwords match', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) });
      const postRequest = vi.fn().mockResolvedValue({ id: 99, username: 'newbie' });
      vi.mocked(usePostRequest).mockReturnValue(postRequest as ReturnType<typeof usePostRequest>);

      render(
        <MemoryRouter initialEntries={['/users/create']}>
          <Routes>
            <Route path="/users/create" element={<CreateUser />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: /username/i })).toBeInTheDocument();
      });

      await user.type(screen.getByRole('textbox', { name: /username/i }), 'newbie');
      await user.type(screen.getByLabelText(/^Password/i), 'secret');
      await user.type(screen.getByLabelText(/Confirm password/i), 'secret');
      await user.click(screen.getByTestId('organization'));
      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'Default' })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('option', { name: 'Default' }));
      await user.click(screen.getByTestId('Submit'));

      await waitFor(() => {
        expect(postRequest).toHaveBeenCalled();
      });
    });
  });

  describe('EditUser', () => {
    it('renders edit form when user is loaded', async () => {
      render(
        <MemoryRouter initialEntries={['/users/1/edit']}>
          <Routes>
            <Route path="/users/:id/edit" element={<EditUser />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('page-title')).toHaveTextContent('Edit edituser');
      });
      expect(screen.queryByTestId('organization-form-group')).not.toBeInTheDocument();
    });

    it('shows breadcrumbs while user is loading', () => {
      server.use(
        http.get(
          ({ request }) => request.url.includes('/users/1/'),
          () => new Promise(() => {})
        )
      );
      render(
        <MemoryRouter initialEntries={['/users/1/edit']}>
          <Routes>
            <Route path="/users/:id/edit" element={<EditUser />} />
          </Routes>
        </MemoryRouter>
      );
      expect(screen.getByText('Edit User')).toBeInTheDocument();
    });
  });
});
