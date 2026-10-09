import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { describe, expect, test } from 'vitest';
import { PlatformActiveUserContext } from '@ansible/platform-ui/main/PlatformActiveUserProvider';
import type { PlatformUser } from '@ansible/platform-ui/interfaces/PlatformUser';
import { useCanEditAutomationAnalyticsSettings } from './useCanEditAutomationAnalyticsSettings';

function renderCanEdit(activePlatformUser: PlatformUser | null | undefined) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <PlatformActiveUserContext.Provider value={{ activePlatformUser }}>
      {children}
    </PlatformActiveUserContext.Provider>
  );
  return renderHook(() => useCanEditAutomationAnalyticsSettings(), { wrapper });
}

describe('useCanEditAutomationAnalyticsSettings', () => {
  test.each<{ role: string; user: PlatformUser | null | undefined; expected: boolean }>([
    {
      role: 'a superuser',
      user: { is_superuser: true, is_platform_auditor: false } as PlatformUser,
      expected: true,
    },
    {
      role: 'a platform auditor',
      user: { is_superuser: false, is_platform_auditor: true } as PlatformUser,
      expected: false,
    },
    {
      role: 'a regular user',
      user: { is_superuser: false, is_platform_auditor: false } as PlatformUser,
      expected: false,
    },
    { role: 'no active user', user: null, expected: false },
    { role: 'a user that is still loading', user: undefined, expected: false },
  ])('should return $expected for $role', ({ user, expected }) => {
    const { result } = renderCanEdit(user);

    expect(result.current).toBe(expected);
  });
});
