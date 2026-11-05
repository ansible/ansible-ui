import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Organization } from '../../../interfaces/Organization';
import { AwxUser } from '../../../interfaces/User';
import { useAddOrganizationsToUsers } from './useAddOrganizationsToUsers';
import { useSelectOrganizations } from './useSelectOrganizations';
import { useSelectOrganizationsAddUsers } from './useSelectOrganizationsAddUsers';

vi.mock('./useSelectOrganizations');
vi.mock('./useAddOrganizationsToUsers');

describe('useSelectOrganizationsAddUsers', () => {
  const selectOrganizations = vi.fn();
  const addOrganizationsToUsers = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSelectOrganizations).mockReturnValue(selectOrganizations);
    vi.mocked(useAddOrganizationsToUsers).mockReturnValue(addOrganizationsToUsers);
  });

  it('opens organization picker then adds users to selected organizations', () => {
    const onClose = vi.fn();
    const users = [{ id: 1, username: 'alice' } as AwxUser];
    const orgs = [{ id: 5, name: 'Eng' } as Organization];

    const { result } = renderHook(() => useSelectOrganizationsAddUsers(onClose));
    result.current(users);

    expect(selectOrganizations).toHaveBeenCalledWith(
      expect.stringContaining('Add users to organizations'),
      expect.any(Function)
    );
    const onSelect = selectOrganizations.mock.calls[0]?.[1] as (
      organizations: Organization[]
    ) => void;
    onSelect(orgs);
    expect(addOrganizationsToUsers).toHaveBeenCalledWith(users, orgs, onClose);
  });
});
