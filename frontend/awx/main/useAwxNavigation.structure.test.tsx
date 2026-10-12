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

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    Navigate: () => null,
    useLocation: () => ({ pathname: '/', search: '', hash: '', state: null, key: 'default' }),
  };
});
vi.mock('../common/useAwxActiveUser');
vi.mock('../analytics/automation-dashboard/common/useAutomationDashboardCollectionStatus');

function setupActiveUser(user: Partial<AwxUser> | undefined) {
  vi.mocked(useAwxActiveUser).mockReturnValue({
    activeAwxUser: user as AwxUser | undefined,
    refreshActiveAwxUser: vi.fn(),
  });
}

function setupCollectionStatus() {
  vi.mocked(useAutomationDashboardCollectionStatus).mockReturnValue({
    collectionStatus: {
      enabled: true,
      last_sync: null,
      show_dashboard: true,
      show_leaderboard: true,
    },
    isLoading: false,
    canSeeDashboard: true,
    canSeeLeaderboard: true,
    error: undefined,
    isUnavailable: false,
  });
}

function getChildIds(item: PageNavigationItem | undefined): string[] {
  if (!item || !('children' in item) || !item.children) {
    return [];
  }
  return item.children.map((child) => child.id).filter((id): id is string => Boolean(id));
}

describe('useAwxNavigation structure', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupCollectionStatus();
    setupActiveUser({ id: 1, is_superuser: true, is_system_auditor: false });
  });

  test('should expose top-level resource navigation entries', () => {
    const { result } = renderHook(() => useAwxNavigation());
    const topLevelIds = result.current
      .map((item) => item.id)
      .filter((id): id is string => Boolean(id));

    expect(topLevelIds).toEqual(
      expect.arrayContaining([
        AwxRoute.Overview,
        AwxRoute.Jobs,
        AwxRoute.Templates,
        AwxRoute.Schedules,
        AwxRoute.Projects,
        AwxRoute.Infrastructure,
        AwxRoute.Analytics,
        AwxRoute.Administration,
        AwxRoute.Access,
        AwxRoute.Settings,
      ])
    );
  });

  test('should include topology for superusers under infrastructure', () => {
    const { result } = renderHook(() => useAwxNavigation());
    const infrastructure = findNavigationItemById(result.current, AwxRoute.Infrastructure);

    expect(getChildIds(infrastructure)).toEqual(
      expect.arrayContaining([
        AwxRoute.TopologyView,
        AwxRoute.Inventories,
        AwxRoute.Hosts,
        AwxRoute.InstanceGroups,
        AwxRoute.Instances,
        AwxRoute.ExecutionEnvironments,
      ])
    );
  });

  test('should omit topology for non-superusers under infrastructure', () => {
    setupActiveUser({ id: 1, is_superuser: false, is_system_auditor: false });
    const { result } = renderHook(() => useAwxNavigation());
    const infrastructure = findNavigationItemById(result.current, AwxRoute.Infrastructure);

    expect(getChildIds(infrastructure)).not.toContain(AwxRoute.TopologyView);
    expect(getChildIds(infrastructure)).toEqual(
      expect.arrayContaining([AwxRoute.Inventories, AwxRoute.InstanceGroups])
    );
  });

  test('should include management jobs in administration for superusers only', () => {
    const { result } = renderHook(() => useAwxNavigation());
    const administration = findNavigationItemById(result.current, AwxRoute.Administration);

    expect(getChildIds(administration)).toEqual(
      expect.arrayContaining([
        AwxRoute.ActivityStream,
        AwxRoute.Deprecations,
        AwxRoute.WorkflowApprovals,
        AwxRoute.NotificationTemplates,
        AwxRoute.ManagementJobs,
      ])
    );
  });

  test('should omit management jobs in administration for non-superusers', () => {
    setupActiveUser({ id: 1, is_superuser: false, is_system_auditor: false });
    const { result } = renderHook(() => useAwxNavigation());
    const administration = findNavigationItemById(result.current, AwxRoute.Administration);

    expect(getChildIds(administration)).not.toContain(AwxRoute.ManagementJobs);
    expect(getChildIds(administration)).toEqual(
      expect.arrayContaining([AwxRoute.ActivityStream, AwxRoute.NotificationTemplates])
    );
  });

  test('should nest access management routes under access', () => {
    const { result } = renderHook(() => useAwxNavigation());
    const access = findNavigationItemById(result.current, AwxRoute.Access);

    expect(getChildIds(access)).toEqual(
      expect.arrayContaining([
        AwxRoute.SettingsAuthentication,
        AwxRoute.Organizations,
        AwxRoute.Teams,
        AwxRoute.Users,
        AwxRoute.Roles,
        AwxRoute.Credentials,
        AwxRoute.CredentialTypes,
      ])
    );
  });

  test('should expose settings categories', () => {
    const { result } = renderHook(() => useAwxNavigation());
    const settings = findNavigationItemById(result.current, AwxRoute.Settings);

    expect(getChildIds(settings)).toEqual(
      expect.arrayContaining([
        AwxRoute.SettingsPreferences,
        AwxRoute.SettingsSystem,
        AwxRoute.SettingsJobs,
        AwxRoute.SettingsLogging,
        AwxRoute.SettingsTroubleshooting,
      ])
    );
  });
});
