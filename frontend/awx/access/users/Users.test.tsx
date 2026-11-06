import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { Users } from './Users';

const selectTeamsAddUsers = vi.fn();
const selectTeamsRemoveUsers = vi.fn();
const selectOrganizationsAddUsers = vi.fn();
const selectOrganizationsRemoveUsers = vi.fn();
const deleteUsers = vi.fn();
const pageNavigate = vi.fn();
vi.mock('./hooks/useDeleteUsers', () => ({ useDeleteUsers: () => deleteUsers }));
vi.mock('../teams/hooks/useSelectTeamsAddUsers', () => ({
  useSelectTeamsAddUsers: () => selectTeamsAddUsers,
}));
vi.mock('../teams/hooks/useSelectTeamsRemoveUsers', () => ({
  useSelectTeamsRemoveUsers: () => selectTeamsRemoveUsers,
}));
vi.mock('../organizations/hooks/useSelectOrganizationsAddUsers', () => ({
  useSelectOrganizationsAddUsers: () => selectOrganizationsAddUsers,
}));
vi.mock('../organizations/hooks/useSelectOrganizationsRemoveUsers', () => ({
  useSelectOrganizationsRemoveUsers: () => selectOrganizationsRemoveUsers,
}));
vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  return { ...actual, usePageNavigate: () => pageNavigate };
});

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

  describe('bulk toolbar actions', () => {
    it('invokes bulk user management actions', { timeout: 20000 }, async () => {
      const user = userEvent.setup();
      renderUsers();
      await waitFor(() => expect(screen.getByText('admin')).toBeInTheDocument());
      const rowCheckboxes = screen.getAllByRole('checkbox', { name: /select row/i });
      await user.click(rowCheckboxes[0] as HTMLElement);
      await user.click(rowCheckboxes[1] as HTMLElement);
      const toolbarActions = screen.getByRole('button', { name: /toolbar actions/i });
      await user.click(toolbarActions);
      await user.click(await screen.findByRole('menuitem', { name: /add users to teams/i }));
      expect(selectTeamsAddUsers).toHaveBeenCalled();
      await user.click(toolbarActions);
      await user.click(await screen.findByRole('menuitem', { name: /remove users from teams/i }));
      expect(selectTeamsRemoveUsers).toHaveBeenCalled();
      await user.click(toolbarActions);
      await user.click(
        await screen.findByRole('menuitem', { name: /add users to organizations/i })
      );
      expect(selectOrganizationsAddUsers).toHaveBeenCalled();
      await user.click(toolbarActions);
      await user.click(
        await screen.findByRole('menuitem', { name: /remove users from organizations/i })
      );
      expect(selectOrganizationsRemoveUsers).toHaveBeenCalled();
      await user.click(toolbarActions);
      await user.click(await screen.findByRole('menuitem', { name: /delete users/i }));
      expect(deleteUsers).toHaveBeenCalled();
    });
  });

  describe('row actions', () => {
    it('invokes row user management actions', { timeout: 20000 }, async () => {
      const user = userEvent.setup();
      renderUsers();
      await waitFor(() => expect(screen.getByText('normal_user')).toBeInTheDocument());
      const row = screen.getByText('normal_user').closest('tr');
      const rowScope = within(row as HTMLElement);
      await user.click(rowScope.getByRole('button', { name: /edit user/i }));
      expect(pageNavigate).toHaveBeenCalled();
      const kebab = row?.querySelector('button[aria-label="kebab dropdown toggle"]');
      await user.click(kebab as HTMLElement);
      await user.click(await screen.findByRole('menuitem', { name: /add user to teams/i }));
      expect(selectTeamsAddUsers).toHaveBeenCalled();
      await user.click(kebab as HTMLElement);
      await user.click(await screen.findByRole('menuitem', { name: /remove user from teams/i }));
      expect(selectTeamsRemoveUsers).toHaveBeenCalled();
      await user.click(kebab as HTMLElement);
      await user.click(await screen.findByRole('menuitem', { name: /add user to organizations/i }));
      expect(selectOrganizationsAddUsers).toHaveBeenCalled();
      await user.click(kebab as HTMLElement);
      await user.click(
        await screen.findByRole('menuitem', { name: /remove user from organizations/i })
      );
      expect(selectOrganizationsRemoveUsers).toHaveBeenCalled();
      await user.click(kebab as HTMLElement);
      await user.click(await screen.findByRole('menuitem', { name: /^delete user$/i }));
      expect(deleteUsers).toHaveBeenCalled();
    });
  });
});
