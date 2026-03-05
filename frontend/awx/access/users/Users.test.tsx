import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { Users } from './Users';

const mockUsers = {
  count: 2,
  next: null,
  previous: null,
  results: [
    {
      id: 1,
      type: 'user',
      username: 'admin',
      first_name: 'Admin',
      last_name: 'User',
      email: 'admin@example.com',
      is_superuser: true,
      summary_fields: {
        user_capabilities: { edit: true, delete: false },
      },
    },
    {
      id: 2,
      type: 'user',
      username: 'normal_user',
      first_name: 'Normal',
      last_name: 'User',
      email: 'normal@example.com',
      is_superuser: false,
      summary_fields: {
        user_capabilities: { edit: true, delete: true },
      },
    },
  ],
};

const usersOptionsHandler = {
  actions: {},
};
const usersOptionsWithPostHandler = {
  actions: {
    POST: {
      name: { required: true, label: 'Name', max_length: 512 },
    },
  },
};

const server = setupServer(
  http.options(awxAPI`/users/`, () => HttpResponse.json(usersOptionsHandler)),
  http.get(awxAPI`/users/`, () => HttpResponse.json(mockUsers))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const renderUsers = () => {
  return render(
    <MemoryRouter>
      <Users />
    </MemoryRouter>
  );
};

describe('Users', () => {
  describe('users list page', () => {
    it('should render the users list page with title', async () => {
      renderUsers();

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Users' })).toBeInTheDocument();
      });
    });

    it('should render page description', async () => {
      renderUsers();

      await waitFor(() => {
        expect(
          screen.getByText(/A user is someone who has access to .* with associated permissions/)
        ).toBeInTheDocument();
      });
    });
  });

  describe('users table', () => {
    it('should display users in a table', async () => {
      renderUsers();

      await waitFor(() => {
        expect(screen.getByText('admin')).toBeInTheDocument();
        expect(screen.getByText('normal_user')).toBeInTheDocument();
      });
    });

    it('should display table with expected column headers', async () => {
      renderUsers();

      await waitFor(() => {
        expect(screen.getByText('admin')).toBeInTheDocument();
      });

      expect(screen.getByRole('columnheader', { name: /username/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /first name/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /last name/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /email/i })).toBeInTheDocument();
    });

    it('should display user details in table rows', async () => {
      renderUsers();

      await waitFor(() => {
        expect(screen.getByText('admin')).toBeInTheDocument();
      });

      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.getByText('admin@example.com')).toBeInTheDocument();
      expect(screen.getByText('Normal')).toBeInTheDocument();
      expect(screen.getByText('normal@example.com')).toBeInTheDocument();
    });
  });

  describe('Create user button', () => {
    it('should disable Create user button when user lacks permission', async () => {
      renderUsers();

      await waitFor(() => {
        expect(screen.getByText('admin')).toBeInTheDocument();
      });

      const createButton = screen.getByRole('link', { name: /create user/i });
      expect(createButton).toHaveAttribute('aria-disabled', 'true');
    });

    it('should enable Create user button when user has permission', async () => {
      server.use(
        http.options(awxAPI`/users/`, () => HttpResponse.json(usersOptionsWithPostHandler))
      );

      renderUsers();

      await waitFor(() => {
        expect(screen.getByText('admin')).toBeInTheDocument();
      });

      const createButton = screen.getByRole('link', { name: /create user/i });
      expect(createButton).not.toHaveAttribute('aria-disabled', 'true');
    });
  });
});
