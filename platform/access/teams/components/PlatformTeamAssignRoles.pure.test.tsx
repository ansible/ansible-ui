import { describe, expect, it } from 'vitest';
import type { PlatformRole } from '../../../interfaces/PlatformRole';
import {
  buildTeamAssignRolePairs,
  teamAssignRolesPairKey,
  teamAssignRolesResourcesStepHidden,
  teamAssignRolesResourceNameColumnCell,
  teamAssignRolesRoleColumnCell,
} from './PlatformTeamAssignRoles';

describe('teamAssignRolesResourcesStepHidden', () => {
  it('hides resources step for system type', () => {
    expect(teamAssignRolesResourcesStepHidden({ resourceType: 'system' })).toBe(true);
    expect(teamAssignRolesResourcesStepHidden({ resourceType: 'awx.project' })).toBe(false);
  });
});

describe('buildTeamAssignRolePairs', () => {
  const roleA = { id: 1, name: 'R' } as PlatformRole;

  it('pairs each system role with empty resource', () => {
    const pairs = buildTeamAssignRolePairs({
      resourceType: 'system',
      resources: [],
      platformRoles: [roleA],
    });
    expect(pairs).toEqual([{ resource: { id: '', name: '' }, role: roleA }]);
  });

  it('pairs every resource with every role', () => {
    const pairs = buildTeamAssignRolePairs({
      resourceType: 'awx.project',
      resources: [
        { id: '1', name: 'a' },
        { id: '2', name: 'b' },
      ],
      platformRoles: [roleA, { id: 2, name: 'R2' } as PlatformRole],
    });
    expect(pairs).toHaveLength(4);
  });
});

describe('table column helpers', () => {
  it('formats keys and cells', () => {
    const pair = {
      resource: { id: '5', name: 'Res' },
      role: { id: 9, name: 'Role' } as PlatformRole,
    };
    expect(teamAssignRolesPairKey(pair)).toBe('5_9');
    expect(teamAssignRolesResourceNameColumnCell(pair)).toBe('Res');
    expect(teamAssignRolesRoleColumnCell(pair)).toBe('Role');
  });
});
