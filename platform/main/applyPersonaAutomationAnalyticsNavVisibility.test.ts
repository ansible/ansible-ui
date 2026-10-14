import { describe, expect, test } from 'vitest';
import { PageNavigationItem } from '@ansible/ansible-ui-framework';
import { AwxRoute } from '@ansible/awx-ui/main/AwxRoutes';
import { applyPersonaAutomationAnalyticsNavVisibility } from './applyPersonaAutomationAnalyticsNavVisibility';

function buildNav(): PageNavigationItem[] {
  return [
    {
      id: AwxRoute.Analytics,
      label: 'Automation Analytics',
      path: 'analytics',
      children: [],
    },
  ];
}

describe('applyPersonaAutomationAnalyticsNavVisibility', () => {
  test('should do nothing when the persona view switcher is disabled', () => {
    const nav = buildNav();
    applyPersonaAutomationAnalyticsNavVisibility(nav, {
      personaViewSwitcherEnabled: false,
      activePersonaViewId: 'administration',
      canAccessAutomationAnalyticsNav: false,
    });
    expect(nav[0].hidden).toBeUndefined();
  });

  test('should hide analytics in administration view for non-admin users', () => {
    const nav = buildNav();
    applyPersonaAutomationAnalyticsNavVisibility(nav, {
      personaViewSwitcherEnabled: true,
      activePersonaViewId: 'administration',
      canAccessAutomationAnalyticsNav: false,
    });
    expect(nav[0].hidden).toBe(true);
  });

  test('should keep analytics visible in administration view for admin users', () => {
    const nav = buildNav();
    applyPersonaAutomationAnalyticsNavVisibility(nav, {
      personaViewSwitcherEnabled: true,
      activePersonaViewId: 'administration',
      canAccessAutomationAnalyticsNav: true,
    });
    expect(nav[0].hidden).toBeUndefined();
  });

  test('should hide analytics in operator view for all users', () => {
    const nav = buildNav();
    applyPersonaAutomationAnalyticsNavVisibility(nav, {
      personaViewSwitcherEnabled: true,
      activePersonaViewId: 'operator',
      canAccessAutomationAnalyticsNav: true,
    });
    expect(nav[0].hidden).toBe(true);
  });
});
