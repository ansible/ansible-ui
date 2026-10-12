import { renderHook } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { useAwxSettingsGroupsBase } from './useAwxSettingsGroups';

describe('useAwxSettingsGroupsBase', () => {
  test('returns the default AWX settings group definitions', () => {
    const { result } = renderHook(() => useAwxSettingsGroupsBase());

    expect(result.current.map((group) => group.id)).toEqual([
      'system',
      'jobs',
      'logging',
      'debug',
      'authentication',
      'policyascode',
      'other',
    ]);
    expect(result.current.find((group) => group.id === 'system')?.name).toBe('System Settings');
    expect(result.current.find((group) => group.id === 'authentication')?.defaultSlugs).toEqual(
      expect.arrayContaining(['ldap', 'saml', 'oidc'])
    );
  });
});
