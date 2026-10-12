import { describe, expect, test } from 'vitest';
import { canAccessPlatformAutomationAnalyticsNav } from './canAccessPlatformAutomationAnalyticsNav';

describe('canAccessPlatformAutomationAnalyticsNav', () => {
  test('should deny access while platform user is pending', () => {
    expect(
      canAccessPlatformAutomationAnalyticsNav({
        activePlatformUser: undefined,
        isPlatformUserPending: true,
        activeAwxUser: { is_superuser: true, is_system_auditor: false },
      })
    ).toBe(false);
  });

  test('should deny access while AWX user is pending', () => {
    expect(
      canAccessPlatformAutomationAnalyticsNav({
        activePlatformUser: { is_superuser: true, is_platform_auditor: false },
        activeAwxUser: undefined,
        isAwxUserPending: true,
      })
    ).toBe(false);
  });

  test('should allow platform superuser', () => {
    expect(
      canAccessPlatformAutomationAnalyticsNav({
        activePlatformUser: { is_superuser: true, is_platform_auditor: false },
      })
    ).toBe(true);
  });

  test('should allow platform auditor', () => {
    expect(
      canAccessPlatformAutomationAnalyticsNav({
        activePlatformUser: { is_superuser: false, is_platform_auditor: true },
      })
    ).toBe(true);
  });

  test('should allow AWX superuser without platform admin role', () => {
    expect(
      canAccessPlatformAutomationAnalyticsNav({
        activePlatformUser: { is_superuser: false, is_platform_auditor: false },
        activeAwxUser: { is_superuser: true, is_system_auditor: false },
      })
    ).toBe(true);
  });

  test('should allow AWX system auditor without platform admin role', () => {
    expect(
      canAccessPlatformAutomationAnalyticsNav({
        activePlatformUser: null,
        activeAwxUser: { is_superuser: false, is_system_auditor: true },
      })
    ).toBe(true);
  });

  test('should deny regular platform and AWX users', () => {
    expect(
      canAccessPlatformAutomationAnalyticsNav({
        activePlatformUser: { is_superuser: false, is_platform_auditor: false },
        activeAwxUser: { is_superuser: false, is_system_auditor: false },
      })
    ).toBe(false);
  });
});
