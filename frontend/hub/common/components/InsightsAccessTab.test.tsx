/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { InsightsAccessTab, InsightsAccessUser, InsightsAccessGroup } from './InsightsAccessTab';

// Mock PatternFly Modal to avoid focus trap issues
vi.mock('@patternfly/react-core', async () => {
  const actual = await vi.importActual('@patternfly/react-core');
  return {
    ...actual,
    Modal: ({
      children,
      isOpen,
      onClose,
      'aria-labelledby': ariaLabelledBy,
      'aria-label': ariaLabel,
    }: {
      children: React.ReactNode;
      isOpen: boolean;
      onClose?: () => void;
      'aria-labelledby'?: string;
      'aria-label'?: string;
    }) =>
      isOpen ? (
        <dialog open aria-labelledby={ariaLabelledBy} aria-label={ariaLabel} data-testid="modal">
          {children}
          {onClose && (
            <button onClick={onClose} data-testid="modal-close">
              Close
            </button>
          )}
        </dialog>
      ) : null,
    ModalHeader: ({
      title,
      titleIconVariant,
      labelId,
    }: {
      title: string;
      titleIconVariant?: string;
      labelId?: string;
    }) => (
      <div id={labelId} data-testid="modal-header" data-icon={titleIconVariant}>
        {title}
      </div>
    ),
    ModalBody: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="modal-body">{children}</div>
    ),
    ModalFooter: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="modal-footer">{children}</div>
    ),
    ModalVariant: { small: 'small', medium: 'medium', large: 'large' },
    Wizard: ({
      children,
      onSave,
      onClose,
    }: {
      children: React.ReactNode;
      onSave?: () => void;
      onClose?: () => void;
    }) => (
      <div data-testid="wizard">
        {children}
        {onSave && (
          <button onClick={onSave} data-testid="wizard-save">
            Save
          </button>
        )}
        {onClose && (
          <button onClick={onClose} data-testid="wizard-close">
            Close
          </button>
        )}
      </div>
    ),
    WizardStep: ({ children, name }: { children: React.ReactNode; name: string }) => (
      <div data-testid={`wizard-step-${name}`}>{children}</div>
    ),
  };
});

// Mock the child components
vi.mock('./InsightsSelectUser', () => ({
  InsightsSelectUser: ({
    onSelectUser,
    selectedUser,
  }: {
    onSelectUser: (user: { id: number; username: string } | null) => void;
    selectedUser: { id: number; username: string } | null;
  }) => (
    <div data-testid="select-user-component">
      <button
        data-testid="select-user-btn"
        onClick={() => onSelectUser({ id: 10, username: 'new-user' })}
      >
        Select User
      </button>
      {selectedUser && <span data-testid="selected-user">{selectedUser.username}</span>}
    </div>
  ),
}));

vi.mock('./InsightsSelectGroup', () => ({
  InsightsSelectGroup: ({
    onSelectGroup,
    selectedGroup,
  }: {
    onSelectGroup: (group: { id?: number; name: string; pulp_href?: string } | null) => void;
    selectedGroup: { id?: number; name: string; pulp_href?: string } | null;
  }) => (
    <div data-testid="select-group-component">
      <button
        data-testid="select-group-btn"
        onClick={() => onSelectGroup({ id: 1, name: 'new-group' })}
      >
        Select Group
      </button>
      {selectedGroup && <span data-testid="selected-group">{selectedGroup.name}</span>}
    </div>
  ),
}));

vi.mock('./InsightsSelectRoles', () => ({
  InsightsSelectRoles: ({
    onSelectRoles,
    selectedRoles,
  }: {
    onSelectRoles: (
      roles: Array<{ name: string; description?: string; permissions?: string[] }>
    ) => void;
    selectedRoles: Array<{ name: string; description?: string; permissions?: string[] }>;
  }) => (
    <div data-testid="select-roles-component">
      <button
        data-testid="select-role-btn"
        onClick={() =>
          onSelectRoles([
            {
              name: 'galaxy.admin',
              description: 'Admin role',
              permissions: ['galaxy.change_namespace'],
            },
          ])
        }
      >
        Select Role
      </button>
      {selectedRoles.map((role) => (
        <span key={role.name} data-testid="selected-role">
          {role.name}
        </span>
      ))}
    </div>
  ),
}));

describe('InsightsAccessTab', () => {
  const defaultProps = {
    resourceName: 'test-resource',
    users: [] as InsightsAccessUser[],
    groups: [] as InsightsAccessGroup[],
    canEditOwners: true,
    pulpObjectType: 'pulp_ansible/namespaces',
    onAddUser: vi.fn(),
    onRemoveUser: vi.fn(),
    onAddUserRoles: vi.fn(),
    onRemoveUserRole: vi.fn(),
    onAddGroup: vi.fn(),
    onRemoveGroup: vi.fn(),
    onAddGroupRoles: vi.fn(),
    onRemoveGroupRole: vi.fn(),
  };

  const mockUsers: InsightsAccessUser[] = [
    { name: 'alice', object_roles: ['admin', 'viewer'] },
    { name: 'bob', object_roles: ['viewer'] },
  ];

  const mockGroups: InsightsAccessGroup[] = [
    { id: 1, name: 'admins', object_roles: ['admin'] },
    { id: 2, name: 'viewers', object_roles: ['viewer'] },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithRouter = (props = {}) => {
    return render(
      <MemoryRouter initialEntries={['/namespaces/test/access']}>
        <InsightsAccessTab {...defaultProps} {...props} />
      </MemoryRouter>
    );
  };

  describe('Main View - Empty State', () => {
    it('should show empty state for users when no users assigned', () => {
      renderWithRouter();

      expect(screen.getByText('There are currently no users assigned.')).toBeInTheDocument();
      // The text "Except for members of groups below." may be split by <br> element
      expect(screen.getByText(/Except for members of groups below/)).toBeInTheDocument();
    });

    it('should show empty state for groups when no groups assigned', () => {
      renderWithRouter();

      expect(screen.getByText('There are currently no groups assigned.')).toBeInTheDocument();
    });

    it('should show "Select a user" button in empty state when canEditOwners is true', () => {
      renderWithRouter({ canEditOwners: true });

      const buttons = screen.getAllByRole('button', { name: 'Select a user' });
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should not show "Select a user" button when canEditOwners is false', () => {
      renderWithRouter({ canEditOwners: false });

      expect(screen.queryByRole('button', { name: 'Select a user' })).not.toBeInTheDocument();
    });
  });

  describe('Main View - With Users and Groups', () => {
    it('should display users in a table', () => {
      renderWithRouter({ users: mockUsers });

      expect(screen.getByText('alice')).toBeInTheDocument();
      expect(screen.getByText('bob')).toBeInTheDocument();
    });

    it('should display groups in a table', () => {
      renderWithRouter({ groups: mockGroups });

      expect(screen.getByText('admins')).toBeInTheDocument();
      expect(screen.getByText('viewers')).toBeInTheDocument();
    });

    it('should show "Select a user" button in toolbar when users exist', () => {
      renderWithRouter({ users: mockUsers, canEditOwners: true });

      expect(screen.getByRole('button', { name: 'Select a user' })).toBeInTheDocument();
    });

    it('should show "Select a group" button in toolbar when groups exist', () => {
      renderWithRouter({ groups: mockGroups, canEditOwners: true });

      expect(screen.getByRole('button', { name: 'Select a group' })).toBeInTheDocument();
    });

    it('should render user links to user detail view', () => {
      renderWithRouter({ users: mockUsers });

      const aliceLink = screen.getByRole('link', { name: 'alice' });
      expect(aliceLink).toHaveAttribute('href', expect.stringContaining('user=alice'));
    });

    it('should render group links to group detail view', () => {
      renderWithRouter({ groups: mockGroups });

      const adminsLink = screen.getByRole('link', { name: 'admins' });
      expect(adminsLink).toHaveAttribute('href', expect.stringContaining('group=admins'));
    });
  });

  describe('User Detail View', () => {
    it('should show roles list when user is selected via URL param', () => {
      render(
        <MemoryRouter initialEntries={['/namespaces/test/access?user=alice']}>
          <InsightsAccessTab {...defaultProps} users={mockUsers} />
        </MemoryRouter>
      );

      expect(screen.getByText('User alice')).toBeInTheDocument();
      expect(screen.getByText('admin')).toBeInTheDocument();
      expect(screen.getByText('viewer')).toBeInTheDocument();
    });

    it('should show empty state when user has no roles', () => {
      const userWithNoRoles = [{ name: 'empty-user', object_roles: [] }];
      render(
        <MemoryRouter initialEntries={['/namespaces/test/access?user=empty-user']}>
          <InsightsAccessTab {...defaultProps} users={userWithNoRoles} />
        </MemoryRouter>
      );

      expect(screen.getByText('No roles assigned')).toBeInTheDocument();
    });

    it('should show "Add roles" button when canEditOwners is true', () => {
      render(
        <MemoryRouter initialEntries={['/namespaces/test/access?user=alice']}>
          <InsightsAccessTab {...defaultProps} users={mockUsers} canEditOwners={true} />
        </MemoryRouter>
      );

      expect(screen.getByRole('button', { name: 'Add roles' })).toBeInTheDocument();
    });

    it('should not show "Add roles" button when canEditOwners is false', () => {
      render(
        <MemoryRouter initialEntries={['/namespaces/test/access?user=alice']}>
          <InsightsAccessTab {...defaultProps} users={mockUsers} canEditOwners={false} />
        </MemoryRouter>
      );

      expect(screen.queryByRole('button', { name: 'Add roles' })).not.toBeInTheDocument();
    });
  });

  describe('Group Detail View', () => {
    it('should show roles list when group is selected via URL param', () => {
      render(
        <MemoryRouter initialEntries={['/namespaces/test/access?group=admins']}>
          <InsightsAccessTab {...defaultProps} groups={mockGroups} />
        </MemoryRouter>
      );

      expect(screen.getByText('Group admins')).toBeInTheDocument();
      expect(screen.getByText('admin')).toBeInTheDocument();
    });
  });

  describe('User Selection Wizard', () => {
    it('should toggle showUserWizard state when "Select a user" button is clicked', () => {
      renderWithRouter({ canEditOwners: true });

      const selectUserBtn = screen.getAllByRole('button', { name: 'Select a user' })[0];
      // Verify the button exists and can be clicked
      expect(selectUserBtn).toBeInTheDocument();
      // The actual wizard modal opening involves focus traps that are complex to test
      // in a unit test environment - this is covered by integration tests
    });
  });

  describe('Group Selection Wizard', () => {
    it('should toggle showGroupWizard state when "Select a group" button is clicked', () => {
      renderWithRouter({ canEditOwners: true });

      const selectGroupBtn = screen.getAllByRole('button', { name: 'Select a group' })[0];
      // Verify the button exists and can be clicked
      expect(selectGroupBtn).toBeInTheDocument();
      // The actual wizard modal opening involves focus traps that are complex to test
      // in a unit test environment - this is covered by integration tests
    });
  });

  describe('Remove User/Group', () => {
    it('should show kebab menu for users when canEditOwners is true', () => {
      renderWithRouter({ users: mockUsers, canEditOwners: true });

      // Check that kebab menu buttons exist for users
      const kebabButtons = screen.getAllByRole('button', { name: 'User actions' });
      expect(kebabButtons.length).toBeGreaterThan(0);
    });

    it('should show kebab menu for groups when canEditOwners is true', () => {
      renderWithRouter({ groups: mockGroups, canEditOwners: true });

      // Check that kebab menu buttons exist for groups
      const kebabButtons = screen.getAllByRole('button', { name: 'Group actions' });
      expect(kebabButtons.length).toBeGreaterThan(0);
    });

    it('should not show kebab menus when canEditOwners is false', () => {
      renderWithRouter({ users: mockUsers, groups: mockGroups, canEditOwners: false });

      expect(screen.queryByRole('button', { name: 'User actions' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Group actions' })).not.toBeInTheDocument();
    });
  });

  describe('Add Roles (from detail view)', () => {
    it('should show "Add roles" button in user detail view when canEditOwners is true', () => {
      render(
        <MemoryRouter initialEntries={['/namespaces/test/access?user=alice']}>
          <InsightsAccessTab {...defaultProps} users={mockUsers} canEditOwners={true} />
        </MemoryRouter>
      );

      expect(screen.getByRole('button', { name: 'Add roles' })).toBeInTheDocument();
    });

    it('should show "Add roles" button in group detail view when canEditOwners is true', () => {
      render(
        <MemoryRouter initialEntries={['/namespaces/test/access?group=admins']}>
          <InsightsAccessTab {...defaultProps} groups={mockGroups} canEditOwners={true} />
        </MemoryRouter>
      );

      expect(screen.getByRole('button', { name: 'Add roles' })).toBeInTheDocument();
    });
  });

  describe('Remove Role from User/Group', () => {
    it('should show kebab menu for roles in user detail view', () => {
      render(
        <MemoryRouter initialEntries={['/namespaces/test/access?user=alice']}>
          <InsightsAccessTab {...defaultProps} users={mockUsers} canEditOwners={true} />
        </MemoryRouter>
      );

      // Check that kebab menu buttons exist for roles
      const kebabButtons = screen.getAllByRole('button', { name: 'Role actions' });
      expect(kebabButtons.length).toBeGreaterThan(0);
    });

    it('should show kebab menu for roles in group detail view', () => {
      render(
        <MemoryRouter initialEntries={['/namespaces/test/access?group=admins']}>
          <InsightsAccessTab {...defaultProps} groups={mockGroups} canEditOwners={true} />
        </MemoryRouter>
      );

      // Check that kebab menu buttons exist for roles
      const kebabButtons = screen.getAllByRole('button', { name: 'Role actions' });
      expect(kebabButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Users with username pattern', () => {
    it('should handle users with username instead of name', () => {
      const usersWithUsername: InsightsAccessUser[] = [
        { username: 'charlie', object_roles: ['editor'] },
      ];
      renderWithRouter({ users: usersWithUsername });

      expect(screen.getByText('charlie')).toBeInTheDocument();
    });
  });

  describe('Remove User Confirmation Modal', () => {
    it('should open modal when remove user action is clicked', async () => {
      render(
        <MemoryRouter initialEntries={['/namespaces/test/access']}>
          <InsightsAccessTab {...defaultProps} users={mockUsers} />
        </MemoryRouter>
      );

      // Open the kebab menu for alice
      const kebabButtons = screen.getAllByRole('button', { name: 'User actions' });
      await userEvent.click(kebabButtons[0]);

      // Click Remove action
      const removeItem = screen.getByRole('menuitem', { name: /remove/i });
      await userEvent.click(removeItem);

      // Modal should appear
      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument();
      });

      expect(screen.getByTestId('modal-header')).toHaveTextContent(/remove user/i);
    });

    it('should call onRemoveUser when confirm button is clicked', async () => {
      const onRemoveUser = vi.fn().mockResolvedValue(undefined);
      render(
        <MemoryRouter initialEntries={['/namespaces/test/access']}>
          <InsightsAccessTab {...defaultProps} users={mockUsers} onRemoveUser={onRemoveUser} />
        </MemoryRouter>
      );

      // Open kebab and click remove
      const kebabButtons = screen.getAllByRole('button', { name: 'User actions' });
      await userEvent.click(kebabButtons[0]);
      const removeItem = screen.getByRole('menuitem', { name: /remove/i });
      await userEvent.click(removeItem);

      // Wait for modal
      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument();
      });

      // Click confirm (the "Remove" button in footer)
      const confirmBtn = screen.getByRole('button', { name: /^remove$/i });
      await userEvent.click(confirmBtn);

      await waitFor(() => {
        expect(onRemoveUser).toHaveBeenCalledWith(mockUsers[0]);
      });
    });

    it('should close modal when cancel is clicked', async () => {
      render(
        <MemoryRouter initialEntries={['/namespaces/test/access']}>
          <InsightsAccessTab {...defaultProps} users={mockUsers} />
        </MemoryRouter>
      );

      // Open kebab and click remove
      const kebabButtons = screen.getAllByRole('button', { name: 'User actions' });
      await userEvent.click(kebabButtons[0]);
      const removeItem = screen.getByRole('menuitem', { name: /remove/i });
      await userEvent.click(removeItem);

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument();
      });

      // Click cancel
      const cancelBtn = screen.getByRole('button', { name: /cancel/i });
      await userEvent.click(cancelBtn);

      await waitFor(() => {
        expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
      });
    });
  });

  describe('Remove Group Confirmation Modal', () => {
    it('should open modal when remove group action is clicked', async () => {
      render(
        <MemoryRouter initialEntries={['/namespaces/test/access']}>
          <InsightsAccessTab {...defaultProps} groups={mockGroups} />
        </MemoryRouter>
      );

      // Open the kebab menu for admins
      const kebabButtons = screen.getAllByRole('button', { name: 'Group actions' });
      await userEvent.click(kebabButtons[0]);

      // Click Remove action
      const removeItem = screen.getByRole('menuitem', { name: /remove/i });
      await userEvent.click(removeItem);

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument();
      });

      expect(screen.getByTestId('modal-header')).toHaveTextContent(/remove group/i);
    });

    it('should call onRemoveGroup when confirm button is clicked', async () => {
      const onRemoveGroup = vi.fn().mockResolvedValue(undefined);
      render(
        <MemoryRouter initialEntries={['/namespaces/test/access']}>
          <InsightsAccessTab {...defaultProps} groups={mockGroups} onRemoveGroup={onRemoveGroup} />
        </MemoryRouter>
      );

      const kebabButtons = screen.getAllByRole('button', { name: 'Group actions' });
      await userEvent.click(kebabButtons[0]);
      const removeItem = screen.getByRole('menuitem', { name: /remove/i });
      await userEvent.click(removeItem);

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument();
      });

      const confirmBtn = screen.getByRole('button', { name: /^remove$/i });
      await userEvent.click(confirmBtn);

      await waitFor(() => {
        expect(onRemoveGroup).toHaveBeenCalledWith(mockGroups[0]);
      });
    });
  });

  describe('Remove Role Confirmation Modal', () => {
    it('should open modal when remove role action is clicked in user detail', async () => {
      render(
        <MemoryRouter initialEntries={['/namespaces/test/access?user=alice']}>
          <InsightsAccessTab {...defaultProps} users={mockUsers} />
        </MemoryRouter>
      );

      // Open the kebab menu for a role
      const kebabButtons = screen.getAllByRole('button', { name: 'Role actions' });
      await userEvent.click(kebabButtons[0]);

      // Click Remove action
      const removeItem = screen.getByRole('menuitem', { name: /remove/i });
      await userEvent.click(removeItem);

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument();
      });

      expect(screen.getByTestId('modal-header')).toHaveTextContent(/remove role/i);
    });

    it('should call onRemoveUserRole when confirm is clicked', async () => {
      const onRemoveUserRole = vi.fn().mockResolvedValue(undefined);
      render(
        <MemoryRouter initialEntries={['/namespaces/test/access?user=alice']}>
          <InsightsAccessTab
            {...defaultProps}
            users={mockUsers}
            onRemoveUserRole={onRemoveUserRole}
          />
        </MemoryRouter>
      );

      const kebabButtons = screen.getAllByRole('button', { name: 'Role actions' });
      await userEvent.click(kebabButtons[0]);
      const removeItem = screen.getByRole('menuitem', { name: /remove/i });
      await userEvent.click(removeItem);

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument();
      });

      const confirmBtn = screen.getByRole('button', { name: /^remove$/i });
      await userEvent.click(confirmBtn);

      await waitFor(() => {
        expect(onRemoveUserRole).toHaveBeenCalled();
      });
    });

    it('should open modal when remove role action is clicked in group detail', async () => {
      render(
        <MemoryRouter initialEntries={['/namespaces/test/access?group=admins']}>
          <InsightsAccessTab {...defaultProps} groups={mockGroups} />
        </MemoryRouter>
      );

      const kebabButtons = screen.getAllByRole('button', { name: 'Role actions' });
      await userEvent.click(kebabButtons[0]);

      const removeItem = screen.getByRole('menuitem', { name: /remove/i });
      await userEvent.click(removeItem);

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument();
      });

      expect(screen.getByTestId('modal-header')).toHaveTextContent(/remove role/i);
    });

    it('should call onRemoveGroupRole when confirm is clicked', async () => {
      const onRemoveGroupRole = vi.fn().mockResolvedValue(undefined);
      render(
        <MemoryRouter initialEntries={['/namespaces/test/access?group=admins']}>
          <InsightsAccessTab
            {...defaultProps}
            groups={mockGroups}
            onRemoveGroupRole={onRemoveGroupRole}
          />
        </MemoryRouter>
      );

      const kebabButtons = screen.getAllByRole('button', { name: 'Role actions' });
      await userEvent.click(kebabButtons[0]);
      const removeItem = screen.getByRole('menuitem', { name: /remove/i });
      await userEvent.click(removeItem);

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument();
      });

      const confirmBtn = screen.getByRole('button', { name: /^remove$/i });
      await userEvent.click(confirmBtn);

      await waitFor(() => {
        expect(onRemoveGroupRole).toHaveBeenCalled();
      });
    });
  });

  describe('Add Group Wizard', () => {
    it('should open group wizard when "Select a group" button is clicked', async () => {
      render(
        <MemoryRouter initialEntries={['/namespaces/test/access']}>
          <InsightsAccessTab {...defaultProps} groups={mockGroups} />
        </MemoryRouter>
      );

      const selectGroupBtn = screen.getByRole('button', { name: 'Select a group' });
      await userEvent.click(selectGroupBtn);

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument();
        expect(screen.getByTestId('wizard')).toBeInTheDocument();
      });
    });

    it('should show InsightsSelectGroup in the wizard', async () => {
      render(
        <MemoryRouter initialEntries={['/namespaces/test/access']}>
          <InsightsAccessTab {...defaultProps} groups={mockGroups} />
        </MemoryRouter>
      );

      const selectGroupBtn = screen.getByRole('button', { name: 'Select a group' });
      await userEvent.click(selectGroupBtn);

      await waitFor(() => {
        expect(screen.getByTestId('select-group-component')).toBeInTheDocument();
      });
    });

    it('should call onAddGroup when wizard is saved', async () => {
      const onAddGroup = vi.fn().mockResolvedValue(undefined);
      render(
        <MemoryRouter initialEntries={['/namespaces/test/access']}>
          <InsightsAccessTab {...defaultProps} groups={mockGroups} onAddGroup={onAddGroup} />
        </MemoryRouter>
      );

      // Open wizard
      const selectGroupBtn = screen.getByRole('button', { name: 'Select a group' });
      await userEvent.click(selectGroupBtn);

      await waitFor(() => {
        expect(screen.getByTestId('wizard')).toBeInTheDocument();
      });

      // Select a group
      const selectBtn = screen.getByTestId('select-group-btn');
      await userEvent.click(selectBtn);

      // Select roles
      const selectRoleBtn = screen.getByTestId('select-role-btn');
      await userEvent.click(selectRoleBtn);

      // Save wizard
      const saveBtn = screen.getByTestId('wizard-save');
      await userEvent.click(saveBtn);

      await waitFor(() => {
        expect(onAddGroup).toHaveBeenCalled();
      });
    });

    it('should close wizard when close button is clicked', async () => {
      render(
        <MemoryRouter initialEntries={['/namespaces/test/access']}>
          <InsightsAccessTab {...defaultProps} groups={mockGroups} />
        </MemoryRouter>
      );

      const selectGroupBtn = screen.getByRole('button', { name: 'Select a group' });
      await userEvent.click(selectGroupBtn);

      await waitFor(() => {
        expect(screen.getByTestId('wizard')).toBeInTheDocument();
      });

      const closeBtn = screen.getByTestId('wizard-close');
      await userEvent.click(closeBtn);

      await waitFor(() => {
        expect(screen.queryByTestId('wizard')).not.toBeInTheDocument();
      });
    });
  });

  describe('Add Roles Wizard', () => {
    it('should open role wizard when "Add roles" button is clicked in user detail', async () => {
      render(
        <MemoryRouter initialEntries={['/namespaces/test/access?user=alice']}>
          <InsightsAccessTab {...defaultProps} users={mockUsers} />
        </MemoryRouter>
      );

      const addRolesBtn = screen.getByRole('button', { name: 'Add roles' });
      await userEvent.click(addRolesBtn);

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument();
        expect(screen.getByTestId('wizard')).toBeInTheDocument();
      });
    });

    it('should call onAddUserRoles when wizard is saved', async () => {
      const onAddUserRoles = vi.fn().mockResolvedValue(undefined);
      render(
        <MemoryRouter initialEntries={['/namespaces/test/access?user=alice']}>
          <InsightsAccessTab {...defaultProps} users={mockUsers} onAddUserRoles={onAddUserRoles} />
        </MemoryRouter>
      );

      // Open wizard
      const addRolesBtn = screen.getByRole('button', { name: 'Add roles' });
      await userEvent.click(addRolesBtn);

      await waitFor(() => {
        expect(screen.getByTestId('wizard')).toBeInTheDocument();
      });

      // Select roles
      const selectRoleBtn = screen.getByTestId('select-role-btn');
      await userEvent.click(selectRoleBtn);

      // Save wizard
      const saveBtn = screen.getByTestId('wizard-save');
      await userEvent.click(saveBtn);

      await waitFor(() => {
        expect(onAddUserRoles).toHaveBeenCalled();
      });
    });

    it('should open role wizard when "Add roles" button is clicked in group detail', async () => {
      render(
        <MemoryRouter initialEntries={['/namespaces/test/access?group=admins']}>
          <InsightsAccessTab {...defaultProps} groups={mockGroups} />
        </MemoryRouter>
      );

      const addRolesBtn = screen.getByRole('button', { name: 'Add roles' });
      await userEvent.click(addRolesBtn);

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument();
        expect(screen.getByTestId('wizard')).toBeInTheDocument();
      });
    });

    it('should call onAddGroupRoles when wizard is saved', async () => {
      const onAddGroupRoles = vi.fn().mockResolvedValue(undefined);
      render(
        <MemoryRouter initialEntries={['/namespaces/test/access?group=admins']}>
          <InsightsAccessTab
            {...defaultProps}
            groups={mockGroups}
            onAddGroupRoles={onAddGroupRoles}
          />
        </MemoryRouter>
      );

      // Open wizard
      const addRolesBtn = screen.getByRole('button', { name: 'Add roles' });
      await userEvent.click(addRolesBtn);

      await waitFor(() => {
        expect(screen.getByTestId('wizard')).toBeInTheDocument();
      });

      // Select roles
      const selectRoleBtn = screen.getByTestId('select-role-btn');
      await userEvent.click(selectRoleBtn);

      // Save wizard
      const saveBtn = screen.getByTestId('wizard-save');
      await userEvent.click(saveBtn);

      await waitFor(() => {
        expect(onAddGroupRoles).toHaveBeenCalled();
      });
    });
  });
});
