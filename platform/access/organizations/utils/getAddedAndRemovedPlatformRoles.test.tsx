import { describe, expect, it } from 'vitest';
import { PlatformRbacRole } from '../../../interfaces/PlatformRbacRole';
import { getAddedAndRemovedPlatformRoles } from './getAddedAndRemovedPlatformRoles';

describe('getAddedAndRemovedPlatformRoles', () => {
  it('should return empty array when no roles change', () => {
    const roles = [
      { id: 1, name: 'Admin' },
      { id: 2, name: 'User' },
    ] as PlatformRbacRole[];

    const result = getAddedAndRemovedPlatformRoles(roles, roles);

    expect(result).toEqual([]);
  });

  it('should identify added roles', () => {
    const originalRoles = [{ id: 1, name: 'Admin' }] as PlatformRbacRole[];
    const updatedRoles = [
      { id: 1, name: 'Admin' },
      { id: 2, name: 'User' },
    ] as PlatformRbacRole[];

    const result = getAddedAndRemovedPlatformRoles(originalRoles, updatedRoles);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
    expect(result[0].name).toBe('User');
    expect(result[0].remove).toBeUndefined();
  });

  it('should identify removed roles', () => {
    const originalRoles = [
      { id: 1, name: 'Admin' },
      { id: 2, name: 'User' },
    ] as PlatformRbacRole[];
    const updatedRoles = [{ id: 1, name: 'Admin' }] as PlatformRbacRole[];

    const result = getAddedAndRemovedPlatformRoles(originalRoles, updatedRoles);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
    expect(result[0].name).toBe('User');
    expect(result[0].remove).toBe(true);
  });

  it('should handle both added and removed roles', () => {
    const originalRoles = [
      { id: 1, name: 'Admin' },
      { id: 2, name: 'User' },
    ] as PlatformRbacRole[];
    const updatedRoles = [
      { id: 1, name: 'Admin' },
      { id: 3, name: 'Editor' },
    ] as PlatformRbacRole[];

    const result = getAddedAndRemovedPlatformRoles(originalRoles, updatedRoles);

    expect(result).toHaveLength(2);

    const addedRole = result.find((r) => r.id === 3);
    expect(addedRole).toBeDefined();
    expect(addedRole?.remove).toBeUndefined();

    const removedRole = result.find((r) => r.id === 2);
    expect(removedRole).toBeDefined();
    expect(removedRole?.remove).toBe(true);
  });

  it('should handle empty original roles', () => {
    const originalRoles = [] as PlatformRbacRole[];
    const updatedRoles = [
      { id: 1, name: 'Admin' },
      { id: 2, name: 'User' },
    ] as PlatformRbacRole[];

    const result = getAddedAndRemovedPlatformRoles(originalRoles, updatedRoles);

    expect(result).toHaveLength(2);
    expect(result.every((r) => !r.remove)).toBe(true);
  });

  it('should handle empty updated roles', () => {
    const originalRoles = [
      { id: 1, name: 'Admin' },
      { id: 2, name: 'User' },
    ] as PlatformRbacRole[];
    const updatedRoles = [] as PlatformRbacRole[];

    const result = getAddedAndRemovedPlatformRoles(originalRoles, updatedRoles);

    expect(result).toHaveLength(2);
    expect(result.every((r) => r.remove === true)).toBe(true);
  });

  it('should not duplicate roles in result', () => {
    const originalRoles = [
      { id: 1, name: 'Admin' },
      { id: 2, name: 'User' },
    ] as PlatformRbacRole[];
    const updatedRoles = [
      { id: 3, name: 'Editor' },
      { id: 4, name: 'Viewer' },
    ] as PlatformRbacRole[];

    const result = getAddedAndRemovedPlatformRoles(originalRoles, updatedRoles);

    expect(result).toHaveLength(4);

    const ids = result.map((r) => r.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });
});
