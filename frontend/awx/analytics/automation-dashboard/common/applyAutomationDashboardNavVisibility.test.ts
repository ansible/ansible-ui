import { describe, expect, test } from 'vitest';
import { PageNavigationItem } from '@ansible/ansible-ui-framework/PageNavigation/PageNavigationItem';
import { AwxRoute } from '../../../main/AwxRoutes';
import { applyAutomationDashboardNavVisibility } from './applyAutomationDashboardNavVisibility';

type NavGroup = { id?: string; path: string; children: PageNavigationItem[] };

function buildNav(): NavGroup[] {
  return [
    {
      id: AwxRoute.Analytics,
      path: 'analytics',
      children: [
        {
          id: AwxRoute.AutomationDashboardMainPage,
          path: 'automation-dashboard',
          children: [
            { id: AwxRoute.AutomationDashboard, path: 'dashboard', children: [] },
            { id: AwxRoute.AutomationLeaderboards, path: 'leaderboards', children: [] },
          ],
        },
        { id: AwxRoute.HostMetrics, path: 'host-metrics', children: [] },
      ],
    },
  ];
}

function getMainPage(nav: NavGroup[]): NavGroup | undefined {
  return nav[0].children.find((child) => child.id === AwxRoute.AutomationDashboardMainPage) as
    | NavGroup
    | undefined;
}

describe('applyAutomationDashboardNavVisibility', () => {
  test('should leave the entry and its tabs intact when both views are visible', () => {
    const nav = buildNav();

    applyAutomationDashboardNavVisibility(nav, true, true);

    expect(getMainPage(nav)?.children.map((child) => child.id)).toEqual([
      AwxRoute.AutomationDashboard,
      AwxRoute.AutomationLeaderboards,
    ]);
  });

  test('should drop the tab sub-routes when only the dashboard is visible', () => {
    const nav = buildNav();

    applyAutomationDashboardNavVisibility(nav, true, false);

    expect(getMainPage(nav)?.children).toEqual([]);
  });

  test('should drop the tab sub-routes when only the leaderboards are visible', () => {
    const nav = buildNav();

    applyAutomationDashboardNavVisibility(nav, false, true);

    expect(getMainPage(nav)?.children).toEqual([]);
  });

  test('should remove the entry but keep sibling items when neither view is visible', () => {
    const nav = buildNav();

    applyAutomationDashboardNavVisibility(nav, false, false);

    expect(nav[0].children.map((child) => child.id)).toEqual([AwxRoute.HostMetrics]);
  });

  test('should do nothing when the entry is not in the tree', () => {
    const nav: NavGroup[] = [{ id: AwxRoute.Analytics, path: 'analytics', children: [] }];

    applyAutomationDashboardNavVisibility(nav, true, false);
    applyAutomationDashboardNavVisibility(nav, false, false);

    expect(nav[0].children).toEqual([]);
  });
});
