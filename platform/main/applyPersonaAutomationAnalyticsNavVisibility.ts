import { findNavigationItemById, PageNavigationItem } from '@ansible/ansible-ui-framework';
import { AwxRoute } from '@ansible/awx-ui/main/AwxRoutes';
import type { PersonaViewType } from './persona-view/PersonaView';

/**
 * When the persona view switcher is on, Automation Analytics is an administration capability:
 * hide it from the sidebar for non-admin users (routes stay registered for leaderboard deep links).
 * Operator view always hides it.
 */
export function applyPersonaAutomationAnalyticsNavVisibility(
  navigationItems: PageNavigationItem[],
  options: {
    personaViewSwitcherEnabled: boolean;
    activePersonaViewId: PersonaViewType;
    canAccessAutomationAnalyticsNav: boolean;
  }
): void {
  if (!options.personaViewSwitcherEnabled) {
    return;
  }

  const analytics = findNavigationItemById(navigationItems, AwxRoute.Analytics);
  if (!analytics) {
    return;
  }

  if (options.activePersonaViewId === 'operator') {
    analytics.hidden = true;
    return;
  }

  if (
    options.activePersonaViewId === 'administration' &&
    !options.canAccessAutomationAnalyticsNav
  ) {
    analytics.hidden = true;
  }
}
