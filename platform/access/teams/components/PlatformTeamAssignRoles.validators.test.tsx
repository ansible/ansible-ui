import { describe, expect, it } from 'vitest';
import {
  objectIdForResource,
  validateTeamAssignResourcesStep,
  validateTeamAssignRolesStep,
} from './PlatformTeamAssignRoles';

describe('validateTeamAssignResourcesStep', () => {
  const t = (key: string) => key;

  it('throws when resources are missing or empty', () => {
    expect(() => validateTeamAssignResourcesStep({}, t)).toThrow('Select at least one resource.');
    expect(() => validateTeamAssignResourcesStep({ resources: [] }, t)).toThrow(
      'Select at least one resource.'
    );
  });

  it('does not throw when at least one resource is selected', () => {
    expect(() =>
      validateTeamAssignResourcesStep({ resources: [{ id: '1', name: 'a' }] }, t)
    ).not.toThrow();
  });
});

describe('validateTeamAssignRolesStep', () => {
  const t = (key: string) => key;

  it('throws when roles are missing or empty', () => {
    expect(() => validateTeamAssignRolesStep({}, t)).toThrow('Select at least one role.');
    expect(() => validateTeamAssignRolesStep({ platformRoles: [] }, t)).toThrow(
      'Select at least one role.'
    );
  });

  it('does not throw when at least one role is selected', () => {
    expect(() =>
      validateTeamAssignRolesStep({ platformRoles: [{ id: 1 } as never] }, t)
    ).not.toThrow();
  });
});

describe('objectIdForResource', () => {
  it('resolves pulp id for galaxy.ansiblerepository', () => {
    const uuid = '12345678-1234-1234-1234-123456789012';
    expect(
      objectIdForResource('galaxy.ansiblerepository', {
        id: '1',
        name: 'r',
        pulp_href: `/api/v3/repositories/${uuid}/`,
      })
    ).toBe(uuid);
  });
});
