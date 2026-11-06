import { describe, expect, it } from 'vitest';
import { AccessRole, AwxUser } from '../../interfaces/User';
import { useUserAndTeamRolesLists } from './useUserAndTeamRolesLists';

function role(overrides: Partial<AccessRole> & Pick<AccessRole, 'id' | 'name'>): AccessRole {
  return {
    resource_name: 'resource',
    resource_type: 'organization',
    related: {},
    description: '',
    user_capabilities: { unattach: true },
    ...overrides,
  } as AccessRole;
}

describe('useUserAndTeamRolesLists', () => {
  it('sorts direct and indirect access into user_roles and team_roles', () => {
    const userRole = role({ id: 1, name: 'Admin' });
    const teamRole = role({ id: 2, name: 'Member', team_id: 5, team_name: 'Ops' });
    const users = [
      {
        id: 10,
        username: 'alice',
        summary_fields: {
          direct_access: [{ role: userRole, descendant_roles: [] }],
          indirect_access: [{ role: teamRole, descendant_roles: [] }],
        },
      } as unknown as AwxUser,
    ];

    useUserAndTeamRolesLists(users);

    expect(users[0].user_roles).toEqual([userRole]);
    expect(users[0].team_roles).toEqual([teamRole]);
  });

  it('resets role lists on each call', () => {
    const users = [
      {
        id: 1,
        username: 'bob',
        user_roles: [role({ id: 99, name: 'Stale' })],
        team_roles: [],
        summary_fields: { direct_access: [], indirect_access: [] },
      } as unknown as AwxUser,
    ];

    useUserAndTeamRolesLists(users);

    expect(users[0].user_roles).toEqual([]);
    expect(users[0].team_roles).toEqual([]);
  });

  it('does nothing when users array is empty', () => {
    expect(() => useUserAndTeamRolesLists([])).not.toThrow();
  });
});
