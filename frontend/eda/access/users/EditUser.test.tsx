/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { edaAPI } from '../../common/eda-utils';
import { CreateUser, EditCurrentUser, EditUser } from './EditUser';

const mockUser = {
  id: 42,
  username: 'testuser',
  first_name: 'Test',
  last_name: 'User',
  email: 'test@example.com',
  is_superuser: false,
  created_at: '2024-01-01T00:00:00Z',
  modified_at: '2024-01-01T00:00:00Z',
};

const mockSuperUser = {
  ...mockUser,
  id: 1,
  username: 'admin',
  is_superuser: true,
};

const server = setupServer(
  http.get(edaAPI`/users/42/`, () => HttpResponse.json(mockUser)),
  http.get(edaAPI`/users/me/`, () => HttpResponse.json(mockUser)),
  http.post(edaAPI`/users/`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: 99, ...(body as object) }, { status: 201 });
  }),
  http.patch(edaAPI`/users/42/`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ ...mockUser, ...(body as object) });
  }),
  http.patch(edaAPI`/users/me/`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ ...mockUser, ...(body as object) });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('CreateUser', () => {
  it('should render create user page with title and form fields', async () => {
    render(
      <MemoryRouter>
        <CreateUser />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Create user', level: 1 })).toBeInTheDocument();
    });

    expect(screen.getByRole('textbox', { name: /username/i })).toBeInTheDocument();
    expect(screen.getByText('User type')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /first name/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /last name/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
  });

  it('should display breadcrumbs', async () => {
    render(
      <MemoryRouter>
        <CreateUser />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Users')).toBeInTheDocument();
    });
  });

  it('should not submit when required fields are empty', async () => {
    const postSpy = vi.fn();
    server.use(
      http.post(edaAPI`/users/`, async ({ request }) => {
        postSpy(await request.json());
        return HttpResponse.json({ id: 1 }, { status: 201 });
      })
    );

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <CreateUser />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Create user', level: 1 })).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('Submit'));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Create user', level: 1 })).toBeInTheDocument();
    });

    expect(postSpy).not.toHaveBeenCalled();
  });

  it('should show password mismatch error', { timeout: 15000 }, async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <CreateUser />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /username/i })).toBeInTheDocument();
    });

    await user.type(screen.getByRole('textbox', { name: /username/i }), 'newuser');

    await user.click(screen.getByTestId('usertype'));
    await waitFor(() => {
      expect(screen.getByRole('option', { name: /normal user/i })).toBeInTheDocument();
    });
    await user.click(screen.getByRole('option', { name: /normal user/i }));

    const passwordFields = screen.getAllByPlaceholderText('Enter password');
    await user.type(passwordFields[0], 'password123');
    await user.type(passwordFields[1], 'differentpassword');

    await user.click(screen.getByTestId('Submit'));

    await waitFor(() => {
      expect(screen.getByText('Password does not match.')).toBeInTheDocument();
    });
  });

  it('should validate username characters', { timeout: 10000 }, async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <CreateUser />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /username/i })).toBeInTheDocument();
    });

    await user.type(screen.getByRole('textbox', { name: /username/i }), 'user name!');
    await user.click(screen.getByTestId('Submit'));

    await waitFor(() => {
      expect(
        screen.getByText('Username may contain only letters, numbers, and @.+-_ characters.')
      ).toBeInTheDocument();
    });
  });
});

describe('EditUser', () => {
  it('should render loading state before user data loads', async () => {
    server.use(
      http.get(edaAPI`/users/42/`, () => {
        return new HttpResponse(null, { status: 200 });
      })
    );

    render(
      <MemoryRouter initialEntries={['/users/42/edit']}>
        <Routes>
          <Route path="/users/:id/edit" element={<EditUser />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Edit user')).toBeInTheDocument();
    });
  });

  it('should render edit user form with populated data', async () => {
    render(
      <MemoryRouter initialEntries={['/users/42/edit']}>
        <Routes>
          <Route path="/users/:id/edit" element={<EditUser />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /edit testuser/i, level: 1 })).toBeInTheDocument();
    });

    expect(screen.getByRole('textbox', { name: /username/i })).toHaveValue('testuser');
    expect(screen.getByRole('textbox', { name: /first name/i })).toHaveValue('Test');
    expect(screen.getByRole('textbox', { name: /last name/i })).toHaveValue('User');
    expect(screen.getByRole('textbox', { name: /email/i })).toHaveValue('test@example.com');
  });

  it('should render edit form for superuser with correct heading', async () => {
    server.use(http.get(edaAPI`/users/42/`, () => HttpResponse.json(mockSuperUser)));

    render(
      <MemoryRouter initialEntries={['/users/42/edit']}>
        <Routes>
          <Route path="/users/:id/edit" element={<EditUser />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /edit admin/i, level: 1 })).toBeInTheDocument();
    });

    expect(screen.getByRole('textbox', { name: /username/i })).toHaveValue('admin');
  });

  it('should display breadcrumbs with user link', async () => {
    render(
      <MemoryRouter initialEntries={['/users/42/edit']}>
        <Routes>
          <Route path="/users/:id/edit" element={<EditUser />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Users')).toBeInTheDocument();
    });
  });

  it('should show password mismatch error on edit', { timeout: 10000 }, async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/users/42/edit']}>
        <Routes>
          <Route path="/users/:id/edit" element={<EditUser />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /username/i })).toHaveValue('testuser');
    });

    const passwordFields = screen.getAllByPlaceholderText('Enter password');
    await user.type(passwordFields[0], 'newpassword');
    await user.type(passwordFields[1], 'mismatch');

    await user.click(screen.getByTestId('Submit'));

    await waitFor(() => {
      expect(screen.getByText('Password does not match.')).toBeInTheDocument();
    });
  });
});

describe('EditCurrentUser', () => {
  it('should render loading state before user loads', async () => {
    server.use(http.get(edaAPI`/users/me/`, () => new HttpResponse(null, { status: 200 })));

    render(
      <MemoryRouter>
        <EditCurrentUser />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Edit user')).toBeInTheDocument();
    });
  });

  it('should render edit current user form with populated data', async () => {
    render(
      <MemoryRouter>
        <EditCurrentUser />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /edit testuser/i, level: 1 })).toBeInTheDocument();
    });

    expect(screen.getByRole('textbox', { name: /first name/i })).toHaveValue('Test');
    expect(screen.getByRole('textbox', { name: /last name/i })).toHaveValue('User');
    expect(screen.getByRole('textbox', { name: /email/i })).toHaveValue('test@example.com');
  });

  it('should display current user form fields without username or user type', async () => {
    render(
      <MemoryRouter>
        <EditCurrentUser />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /first name/i })).toBeInTheDocument();
    });

    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: /username/i })).not.toBeInTheDocument();
  });

  it(
    'should show password mismatch error when editing current user',
    { timeout: 10000 },
    async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <EditCurrentUser />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: /first name/i })).toHaveValue('Test');
      });

      const passwordFields = screen.getAllByPlaceholderText('Enter password');
      await user.type(passwordFields[0], 'newpass');
      await user.type(passwordFields[1], 'different');

      await user.click(screen.getByTestId('Submit'));

      await waitFor(() => {
        expect(screen.getByText('Password does not match.')).toBeInTheDocument();
      });
    }
  );
});
