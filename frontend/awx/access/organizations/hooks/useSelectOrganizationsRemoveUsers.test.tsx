import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Organization } from '../../../interfaces/Organization';
import { AwxUser } from '../../../interfaces/User';
import { useRemoveOrganizationsFromUsers } from './useRemoveOrganizationsFromUsers';
import { useSelectOrganizations } from './useSelectOrganizations';
import { useSelectOrganizationsRemoveUsers } from './useSelectOrganizationsRemoveUsers';

vi.mock('./useSelectOrganizations');
vi.mock('./useRemoveOrganizationsFromUsers');

describe('useSelectOrganizationsRemoveUsers', () => {
  const selectOrganizations = vi.fn();
  const removeOrganizationsFromUsers = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSelectOrganizations).mockReturnValue(selectOrganizations);
    vi.mocked(useRemoveOrganizationsFromUsers).mockReturnValue(removeOrganizationsFromUsers);
  });

  it('opens organization picker then removes users from selected organizations', () => {
    const onClose = vi.fn();
    const users = [{ id: 2, username: 'bob' } as AwxUser];
    const orgs = [{ id: 8, name: 'Sales' } as Organization];

    const { result } = renderHook(() => useSelectOrganizationsRemoveUsers(onClose));
    result.current(users);

    expect(selectOrganizations).toHaveBeenCalledWith(
      expect.stringContaining('Remove users from organizations'),
      expect.any(Function)
    );
    const onSelect = selectOrganizations.mock.calls[0]?.[1] as (
      organizations: Organization[]
    ) => void;
    onSelect(orgs);
    expect(removeOrganizationsFromUsers).toHaveBeenCalledWith(users, orgs, onClose);
  });
});
