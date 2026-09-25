import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  findNavigationItemById,
  PageNavigationItem,
} from '@ansible/ansible-ui-framework/PageNavigation/PageNavigationItem';
import { AwxUser } from '../interfaces/User';
import { useAwxActiveUser } from '../common/useAwxActiveUser';
import { useAutomationDashboardCollectionStatus } from '../analytics/automation-dashboard/common/useAutomationDashboardCollectionStatus';
import { AwxRoute } from './AwxRoutes';
import { useAwxNavigation } from './useAwxNavigation';

vi.mock('react-router-dom', () => ({ Navigate: () => null }));
vi.mock('../common/useAwxActiveUser');
vi.mock('../analytics/automation-dashboard/common/useAutomationDashboardCollectionStatus');

vi.mock('@ansible/ansible-ui-framework/PageSettings/PageSettingsDetails', () => ({
  PageSettingsDetails: () => null,
}));
vi.mock('@ansible/ansible-ui-framework/PageSettings/PageSettingsForm', () => ({
  PageSettingsForm: () => null,
}));
vi.mock('../access/roles/AwxRoleDetails', () => ({ AwxRoleDetails: () => null }));
vi.mock('../access/roles/AwxRolePage', () => ({ AwxRolePage: () => null }));
vi.mock('../access/roles/AwxRoles', () => ({ AwxRoles: () => null }));
vi.mock('../access/roles/RoleForm', () => ({ CreateRole: () => null, EditRole: () => null }));
vi.mock('../administration/settings/AwxSettings', () => ({ AwxSettings: () => null }));
vi.mock('../administration/settings/AwxSettingsCategoryDetails', () => ({
  AwxSettingsCategoryDetailsPage: () => null,
}));
vi.mock('../administration/settings/AwxSettingsCategoryForm', () => ({
  AwxSettingsCategoryForm: () => null,
  AwxSettingsCategoryFormRoute: () => null,
}));
vi.mock('../administration/topology/Topology', () => ({ Topology: () => null }));
vi.mock('../analytics/Reports/Reports', () => ({ Reports: () => null }));
vi.mock('../analytics/subscription-usage/SubscriptionUsage', () => ({
  SubscriptionUsage: () => null,
}));
vi.mock('../overview/AwxOverview', () => ({ AwxOverview: () => null }));
vi.mock('../views/jobs/HostMetrics', () => ({ HostMetrics: () => null }));
vi.mock('../analytics/automation-dashboard/AutomationDashboard', () => ({
  AutomationDashboard: () => null,
}));
vi.mock('../analytics/automation-dashboard/AutomationDashboardMainPage', () => ({
  AutomationDashboardMainPage: () => null,
}));
vi.mock('../analytics/automation-dashboard/AutomationLeaderboards', () => ({
  AutomationLeaderboards: () => null,
}));

vi.mock('./routes/useAwxActivityStreamRoutes', () => ({
  useAwxActivityStreamRoutes: () => ({ id: 'activity-stream', path: 'activity-stream' }),
}));
vi.mock('./routes/useAwxDeprecationsRoutes', () => ({
  useAwxDeprecationsRoutes: () => ({ id: 'deprecations', path: 'deprecations' }),
}));
vi.mock('./routes/useAwxCredentialRoutes', () => ({
  useAwxCredentialRoutes: () => ({ id: 'credentials', path: 'credentials' }),
}));
vi.mock('./routes/useAwxCredentialTypesRoutes', () => ({
  useAwxCredentialTypesRoutes: () => ({ id: 'credential-types', path: 'credential-types' }),
}));
vi.mock('./routes/useAwxExecutionEnironmentRoutes', () => ({
  useAwxExecutionEnvironmentRoutes: () => ({ id: 'ees', path: 'execution-environments' }),
}));
vi.mock('./routes/useAwxHostRoutes', () => ({
  useAwxHostRoutes: () => ({ id: 'hosts', path: 'hosts' }),
}));
vi.mock('./routes/useAwxInstanceGroupsRoutes', () => ({
  useAwxInstanceGroupsRoutes: () => ({ id: 'instance-groups', path: 'instance-groups' }),
}));
vi.mock('./routes/useAwxInstancesRoutes', () => ({
  useAwxInstancesRoutes: () => ({ id: 'instances', path: 'instances' }),
}));
vi.mock('./routes/useAwxInventoryRoutes', () => ({
  useAwxInventoryRoutes: () => ({ id: 'inventories', path: 'inventories' }),
}));
vi.mock('./routes/useAwxJobsRoutes', () => ({
  useAwxJobsRoutes: () => ({ id: 'jobs', path: 'jobs' }),
}));
vi.mock('./routes/useAwxManagementJobsRoutes', () => ({
  useAwxManagementJobsRoutes: () => ({ id: 'management-jobs', path: 'management-jobs' }),
}));
vi.mock('./routes/useAwxNotificationsRoutes', () => ({
  useAwxNotificationsRoutes: () => ({ id: 'notifications', path: 'notifications' }),
}));
vi.mock('./routes/useAwxOrganizationsRoutes', () => ({
  useAwxOrganizationRoutes: () => ({ id: 'organizations', path: 'organizations' }),
}));
vi.mock('./routes/useAwxProjectRoutes', () => ({
  useAwxProjectRoutes: () => ({ id: 'projects', path: 'projects' }),
}));
vi.mock('./routes/useAwxSchedulesRoutes', () => ({
  useAwxSchedulesRoutes: () => ({ id: 'schedules', path: 'schedules' }),
}));
vi.mock('./routes/useAwxTeamsRoutes', () => ({
  useAwxTeamsRoutes: () => ({ id: 'teams', path: 'teams' }),
}));
vi.mock('./routes/useAwxTemplateRoutes', () => ({
  useAwxTemplateRoutes: () => ({ id: 'templates', path: 'templates' }),
}));
vi.mock('./routes/useAwxUsersRoutes', () => ({
  useAwxUsersRoutes: () => ({ id: 'users', path: 'users' }),
}));
vi.mock('./routes/useAwxWorkflowApprovalRoutes', () => ({
  useAwxWorkflowApprovalRoutes: () => ({ id: 'workflow-approvals', path: 'workflow-approvals' }),
}));

function setupActiveUser(user: Partial<AwxUser> | undefined) {
  vi.mocked(useAwxActiveUser).mockReturnValue({
    activeAwxUser: user as AwxUser | undefined,
    refreshActiveAwxUser: vi.fn(),
  });
}

function setupCollectionStatus(
  overrides: Partial<ReturnType<typeof useAutomationDashboardCollectionStatus>> = {}
) {
  vi.mocked(useAutomationDashboardCollectionStatus).mockReturnValue({
    collectionStatus: {
      enabled: true,
      min_collection_timestamp: null,
      show_dashboard: true,
      show_gamification: true,
    },
    isLoading: false,
    canSeeDashboard: true,
    canSeeLeaderboard: true,
    error: undefined,
    ...overrides,
  });
}

function getMainPageChildIds(): (string | undefined)[] | undefined {
  const { result } = renderHook(() => useAwxNavigation());
  const mainPage = findNavigationItemById(result.current, AwxRoute.AutomationDashboardMainPage);
  return mainPage && 'children' in mainPage
    ? mainPage.children.map((child) => child.id)
    : undefined;
}

function getAnalyticsChildIds(): (string | undefined)[] {
  const { result } = renderHook(() => useAwxNavigation());
  const analytics = result.current.find((item) => item.id === AwxRoute.Analytics);
  expect(analytics).toBeDefined();
  return (analytics as { children: PageNavigationItem[] }).children.map((child) => child.id);
}

function getAnalyticsHidden(): boolean | undefined {
  const { result } = renderHook(() => useAwxNavigation());
  return result.current.find((item) => item.id === AwxRoute.Analytics)?.hidden;
}

const ADMIN_ONLY_ANALYTICS_ROUTES = [
  AwxRoute.AutomationCalculator,
  AwxRoute.HostMetrics,
  AwxRoute.SubscriptionUsage,
];

describe('useAwxNavigation - Analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupCollectionStatus();
  });

  test('should include every analytics page for a superuser', () => {
    setupActiveUser({ id: 1, is_superuser: true, is_system_auditor: false });

    expect(getAnalyticsChildIds()).toEqual([
      AwxRoute.AutomationDashboardMainPage,
      ...ADMIN_ONLY_ANALYTICS_ROUTES,
    ]);
  });

  test('should include every analytics page for a system auditor', () => {
    setupActiveUser({ id: 1, is_superuser: false, is_system_auditor: true });

    expect(getAnalyticsChildIds()).toEqual([
      AwxRoute.AutomationDashboardMainPage,
      ...ADMIN_ONLY_ANALYTICS_ROUTES,
    ]);
  });

  test('should keep only the Automation Dashboard for a regular user', () => {
    setupActiveUser({ id: 1, is_superuser: false, is_system_auditor: false });

    expect(getAnalyticsChildIds()).toEqual([AwxRoute.AutomationDashboardMainPage]);
  });

  test('should keep only the Automation Dashboard while the active user is unresolved', () => {
    setupActiveUser(undefined);

    expect(getAnalyticsChildIds()).toEqual([AwxRoute.AutomationDashboardMainPage]);
  });

  test('should expose the dashboard tabs and an id on the default-path redirect', () => {
    setupActiveUser({ id: 1, is_superuser: false, is_system_auditor: false });

    const { result } = renderHook(() => useAwxNavigation());
    const analytics = result.current.find((item) => item.id === AwxRoute.Analytics) as {
      children: PageNavigationItem[];
    };
    const mainPage = analytics.children.find(
      (child) => child.id === AwxRoute.AutomationDashboardMainPage
    ) as { children: PageNavigationItem[] };

    expect(mainPage.children.map((child) => [child.id, child.path])).toEqual([
      [AwxRoute.AutomationDashboard, 'dashboard'],
      [AwxRoute.AutomationLeaderboards, 'leaderboards'],
      [AwxRoute.AutomationDashboardRedirect, ''],
    ]);
  });

  describe('Automation Dashboard visibility', () => {
    beforeEach(() => {
      setupActiveUser({ id: 1, is_superuser: false, is_system_auditor: false });
    });

    test('should remove the Automation Dashboard entry when neither view can be seen', () => {
      setupCollectionStatus({ canSeeDashboard: false, canSeeLeaderboard: false });

      expect(getAnalyticsChildIds()).toEqual([]);
    });

    test('should drop the tab sub-routes when only the leaderboards can be seen', () => {
      setupCollectionStatus({ canSeeDashboard: false });

      expect(getMainPageChildIds()).toEqual([]);
    });

    test('should drop the tab sub-routes when only the dashboard can be seen', () => {
      setupCollectionStatus({ canSeeLeaderboard: false });

      expect(getMainPageChildIds()).toEqual([]);
    });

    test('should keep the entry and its tabs while the collection status is loading', () => {
      setupCollectionStatus({ isLoading: true, canSeeDashboard: false, canSeeLeaderboard: false });

      expect(getMainPageChildIds()).toHaveLength(3);
    });

    test('should keep the entry and its tabs when the collection status request fails', () => {
      setupCollectionStatus({
        error: new Error('Server error'),
        canSeeDashboard: false,
        canSeeLeaderboard: false,
      });

      expect(getMainPageChildIds()).toHaveLength(3);
    });
  });

  describe('Analytics group visibility', () => {
    test('should hide the group for a regular user who can see neither view', () => {
      setupActiveUser({ id: 1, is_superuser: false, is_system_auditor: false });
      setupCollectionStatus({ canSeeDashboard: false, canSeeLeaderboard: false });

      expect(getAnalyticsHidden()).toBe(true);
    });

    test('should keep the group visible for a superuser who can see neither view', () => {
      setupActiveUser({ id: 1, is_superuser: true, is_system_auditor: false });
      setupCollectionStatus({ canSeeDashboard: false, canSeeLeaderboard: false });

      expect(getAnalyticsHidden()).toBe(false);
    });

    test('should keep the group visible for a regular user who can see a view', () => {
      setupActiveUser({ id: 1, is_superuser: false, is_system_auditor: false });
      setupCollectionStatus({ canSeeDashboard: false });

      expect(getAnalyticsHidden()).toBe(false);
    });
  });
});
