import {
  findNavigationItemById,
  PageNavigationItem,
  removeNavigationItemById,
} from '@ansible/ansible-ui-framework/PageNavigation/PageNavigationItem';
import { AwxRoute } from '../../../main/AwxRoutes';

/** Hides the Automation Dashboard entry, or drops its tabs, based on what the user can see. */
export function applyAutomationDashboardNavVisibility(
  navigationItems: PageNavigationItem[],
  canSeeDashboard: boolean,
  canSeeLeaderboard: boolean
): void {
  if (canSeeDashboard && canSeeLeaderboard) return;

  if (!canSeeDashboard && !canSeeLeaderboard) {
    removeNavigationItemById(navigationItems, AwxRoute.AutomationDashboardMainPage);
    return;
  }

  const mainPage = findNavigationItemById(navigationItems, AwxRoute.AutomationDashboardMainPage);
  if (mainPage && 'children' in mainPage) {
    mainPage.children = [];
  }
}
