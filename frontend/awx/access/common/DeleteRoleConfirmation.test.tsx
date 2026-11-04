import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { PageDialogProvider } from '../../../../framework/PageDialogs/PageDialog';
import { AccessRole, AwxUser } from '../../interfaces/User';
import { DeleteRoleConfirmation, useDeleteRoleConfirmationDialog } from './DeleteRoleConfirmation';

vi.mock('@patternfly/react-core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@patternfly/react-core')>();
  return {
    ...actual,
    Modal: ({
      children,
      isOpen,
      onClose,
    }: {
      children: React.ReactNode;
      isOpen: boolean;
      onClose?: () => void;
    }) =>
      isOpen ? (
        <dialog data-testid="delete-role-modal" open>
          <button type="button" onClick={onClose} />
          {children}
        </dialog>
      ) : null,
  };
});

const mockRole: AccessRole = {
  id: 1,
  name: 'Admin',
  resource_name: 'Test Org',
  resource_type: 'organization',
  related: {},
  team_id: 1,
  team_name: 'Test Team',
  team_organization_name: 'Test Org',
  description: '',
  user_capabilities: { unattach: true },
};

const mockUser: AwxUser = {
  id: 1,
  username: 'testuser',
  created: '',
  modified: '',
  summary_fields: { user_capabilities: {} },
} as AwxUser;

function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
      <PageDialogProvider>{children}</PageDialogProvider>
    </MemoryRouter>
  );
}

describe('DeleteRoleConfirmation', () => {
  it('should render modal with Remove user access for user role', () => {
    const mockOnConfirm = vi.fn().mockResolvedValue(undefined);

    render(
      <TestWrapper>
        <DeleteRoleConfirmation
          role={{ ...mockRole, team_id: undefined } as unknown as AccessRole}
          user={mockUser}
          onConfirm={mockOnConfirm}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Remove user access')).toBeInTheDocument();
    expect(
      screen.getByText(/Are you sure you want to remove admin access from testuser\?/)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm delete' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('should render modal with Remove team access for team role', () => {
    const mockOnConfirm = vi.fn().mockResolvedValue(undefined);

    render(
      <TestWrapper>
        <DeleteRoleConfirmation role={mockRole} user={mockUser} onConfirm={mockOnConfirm} />
      </TestWrapper>
    );

    expect(screen.getByText('Remove team access')).toBeInTheDocument();
    expect(
      screen.getByText(/Are you sure you want to remove admin access from Test Team\?/)
    ).toBeInTheDocument();
  });

  it('should use custom title when provided', () => {
    const mockOnConfirm = vi.fn().mockResolvedValue(undefined);

    render(
      <TestWrapper>
        <DeleteRoleConfirmation
          title="Custom remove title"
          role={{ ...mockRole, team_id: undefined } as unknown as AccessRole}
          user={mockUser}
          onConfirm={mockOnConfirm}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Custom remove title')).toBeInTheDocument();
  });

  it('calls onConfirm when delete is clicked', async () => {
    const user = userEvent.setup();
    const mockOnConfirm = vi.fn().mockResolvedValue(undefined);
    const role = { ...mockRole, team_id: undefined } as unknown as AccessRole;

    render(
      <TestWrapper>
        <DeleteRoleConfirmation role={role} user={mockUser} onConfirm={mockOnConfirm} />
      </TestWrapper>
    );

    await user.click(screen.getByRole('button', { name: 'Confirm delete' }));
    expect(mockOnConfirm).toHaveBeenCalledWith(role, mockUser);
  });

  it('opens dialog via useDeleteRoleConfirmationDialog', async () => {
    function DialogHost() {
      const openDialog = useDeleteRoleConfirmationDialog();
      return (
        <button
          type="button"
          onClick={() =>
            openDialog({
              role: { ...mockRole, team_id: undefined } as unknown as AccessRole,
              user: mockUser,
              onConfirm: vi.fn().mockResolvedValue(undefined),
            })
          }
        >
          Open
        </button>
      );
    }

    const user = userEvent.setup();
    render(
      <TestWrapper>
        <DialogHost />
      </TestWrapper>
    );

    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByTestId('delete-role-modal')).toBeInTheDocument();
  });
});
