import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useIsValidRoleName } from './useIsValidRoleName';

describe('useIsValidRoleName', () => {
  it('should return undefined for valid role names', () => {
    const { result } = renderHook(() => useIsValidRoleName());
    const isValidRoleName = result.current;

    expect(isValidRoleName('galaxy.my_role')).toBeUndefined();
    expect(isValidRoleName('galaxy.test123')).toBeUndefined();
    expect(isValidRoleName('galaxy.role.name')).toBeUndefined();
    expect(isValidRoleName('galaxy.UPPERCASE')).toBeUndefined();
  });

  it('should return error for names with invalid characters', () => {
    const { result } = renderHook(() => useIsValidRoleName());
    const isValidRoleName = result.current;

    expect(isValidRoleName('galaxy.role-name')).toBeTruthy();
    expect(isValidRoleName('galaxy.role@name')).toBeTruthy();
    expect(isValidRoleName('galaxy.role#name')).toBeTruthy();
  });

  it('should return error for names that are too short', () => {
    const { result } = renderHook(() => useIsValidRoleName());
    const isValidRoleName = result.current;

    expect(isValidRoleName('ga')).toBeTruthy();
    expect(isValidRoleName('g')).toBeTruthy();
    expect(isValidRoleName('')).toBeTruthy();
  });

  it('should return error for names that do not start with galaxy.', () => {
    const { result } = renderHook(() => useIsValidRoleName());
    const isValidRoleName = result.current;

    expect(isValidRoleName('myrole')).toBeTruthy();
    expect(isValidRoleName('role.name')).toBeTruthy();
    expect(isValidRoleName('Galaxy.role')).toBeTruthy();
  });

  it('should validate names starting with galaxy. but check length first', () => {
    const { result } = renderHook(() => useIsValidRoleName());
    const isValidRoleName = result.current;

    expect(isValidRoleName('galaxy.r')).toBeUndefined();
    expect(isValidRoleName('galaxy.ro')).toBeUndefined();
  });
});
