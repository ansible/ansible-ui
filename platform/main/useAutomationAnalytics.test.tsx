/* eslint-disable i18next/no-literal-string */
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { AwxRoute } from '@ansible/awx-ui/main/AwxRoutes';
import { PageNavigationItem } from '@ansible/ansible-ui-framework';
import { useAutomationAnalytics } from './usePlatformNavigation';

// ─── Hoisted mocks ────────────────────────────────────────────────────────────

const {
  mockUseAwxNavigation,
  mockUseHasAwxService,
  mockUseIsManagedCloudInstall,
  mockUsePlatformActiveUser,
  mockUseAutomationDashboardCollectionStatus,
} = vi.hoisted(() => ({
  mockUseAwxNavigation: vi.fn(),
  mockUseHasAwxService: vi.fn(),
  mockUseIsManagedCloudInstall: vi.fn(),
  mockUsePlatformActiveUser: vi.fn(),
  mockUseAutomationDashboardCollectionStatus: vi.fn(),
}));

vi.mock('@ansible/awx-ui/main/useAwxNavigation', () => ({
  useAwxNavigation: mockUseAwxNavigation,
}));

vi.mock('./GatewayServices', () => ({
  useHasAwxService: mockUseHasAwxService,
  useHasEdaService: vi.fn(() => false),
  useHasHubService: vi.fn(() => false),
}));

vi.mock('./GatewayUIAuth', () => ({
  useIsManagedCloudInstall: mockUseIsManagedCloudInstall,
  useIsManagedCloudInstallInternal: vi.fn(() => false),
}));

vi.mock('./PlatformActiveUserProvider', () => ({
  usePlatformActiveUser: mockUsePlatformActiveUser,
}));

vi.mock(
  '../../frontend/awx/analytics/automation-dashboard/common/useAutomationDashboardCollectionStatus',
  () => ({
    useAutomationDashboardCollectionStatus: mockUseAutomationDashboardCollectionStatus,
  })
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns a fresh analytics nav tree on every call to prevent mutation bleed between tests. */
function buildMockNav(): PageNavigationItem[] {
  return [
    {
      id: AwxRoute.Analytics,
      label: 'Analytics',
      path: 'analytics',
      children: [
        {
          id: AwxRoute.AutomationDashboard,
          label: 'Automation Dashboard',
          path: 'automation-dashboard',
          element: <></>,
        },
        {
          id: AwxRoute.SubscriptionUsage,
          label: 'Subscription Usage',
          path: 'subscription-usage',
          element: <></>,
        },
        {
          id: AwxRoute.AutomationCalculator,
          label: 'Automation Calculator',
          path: 'automation-calculator',
          element: <></>,
        },
      ],
    },
  ];
}

type NavGroup = { children: PageNavigationItem[]; hidden?: boolean; label?: string };

function asGroup(item: PageNavigationItem): NavGroup {
  if (!('children' in item)) throw new Error('Expected a navigation group with children');
  return item as NavGroup;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useAutomationAnalytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAwxNavigation.mockImplementation(() => buildMockNav());
    mockUseHasAwxService.mockReturnValue(true);
    mockUseIsManagedCloudInstall.mockReturnValue(false);
    mockUsePlatformActiveUser.mockReturnValue({
      activePlatformUser: { is_superuser: true, is_platform_auditor: false },
    });
    // Dashboard feature enabled by default
    mockUseAutomationDashboardCollectionStatus.mockReturnValue({ enabled: true });
  });

  // --- Label ---

  test('should set analytics label to "Automation Analytics"', () => {
    const { result } = renderHook(() => useAutomationAnalytics());
    expect(result.current.label).toBe('Automation Analytics');
  });

  // --- hidden / visibility ---

  test('should be hidden when AWX service is unavailable', () => {
    mockUseHasAwxService.mockReturnValue(false);
    const { result } = renderHook(() => useAutomationAnalytics());
    expect(result.current.hidden).toBe(true);
  });

  test('should be visible for superuser with AWX service', () => {
    const { result } = renderHook(() => useAutomationAnalytics());
    expect(result.current.hidden).toBe(false);
  });

  test('should be visible for platform auditor with AWX service', () => {
    mockUsePlatformActiveUser.mockReturnValue({
      activePlatformUser: { is_superuser: false, is_platform_auditor: true },
    });
    const { result } = renderHook(() => useAutomationAnalytics());
    expect(result.current.hidden).toBe(false);
  });

  test('should be hidden for non-superuser non-auditor even with AWX service', () => {
    mockUsePlatformActiveUser.mockReturnValue({
      activePlatformUser: { is_superuser: false, is_platform_auditor: false },
    });
    const { result } = renderHook(() => useAutomationAnalytics());
    expect(result.current.hidden).toBe(true);
  });

  test('should be hidden when AWX service is unavailable even for superuser', () => {
    mockUseHasAwxService.mockReturnValue(false);
    const { result } = renderHook(() => useAutomationAnalytics());
    expect(result.current.hidden).toBe(true);
  });

  test('should be hidden when activePlatformUser is null', () => {
    mockUsePlatformActiveUser.mockReturnValue({ activePlatformUser: null });
    const { result } = renderHook(() => useAutomationAnalytics());
    expect(result.current.hidden).toBe(true);
  });

  // --- managed cloud install ---

  test('should remove SubscriptionUsage from children when managed cloud install', () => {
    mockUseIsManagedCloudInstall.mockReturnValue(true);
    const { result } = renderHook(() => useAutomationAnalytics());
    const { children } = asGroup(result.current);
    expect(children.find((c) => c.id === AwxRoute.SubscriptionUsage)).toBeUndefined();
  });

  test('should keep SubscriptionUsage in children when not managed cloud install', () => {
    const { result } = renderHook(() => useAutomationAnalytics());
    const { children } = asGroup(result.current);
    expect(children.find((c) => c.id === AwxRoute.SubscriptionUsage)).toBeDefined();
  });

  // --- automationDashboardEnabled = true ---

  describe('when automationDashboardEnabled is true', () => {
    test('should preserve all children for superuser', () => {
      const { result } = renderHook(() => useAutomationAnalytics());
      const { children } = asGroup(result.current);
      expect(children).toHaveLength(3);
      expect(children.map((c) => c.id)).toContain(AwxRoute.AutomationDashboard);
      expect(children.map((c) => c.id)).toContain(AwxRoute.SubscriptionUsage);
      expect(children.map((c) => c.id)).toContain(AwxRoute.AutomationCalculator);
    });

    test('should keep only automation dashboard for non-superuser auditor', () => {
      mockUsePlatformActiveUser.mockReturnValue({
        activePlatformUser: { is_superuser: false, is_platform_auditor: true },
      });
      const { result } = renderHook(() => useAutomationAnalytics());
      const { children } = asGroup(result.current);
      expect(children).toHaveLength(1);
      expect(children[0].id).toBe(AwxRoute.AutomationDashboard);
    });

    test('should keep only automation dashboard for non-superuser non-auditor', () => {
      mockUsePlatformActiveUser.mockReturnValue({
        activePlatformUser: { is_superuser: false, is_platform_auditor: false },
      });
      const { result } = renderHook(() => useAutomationAnalytics());
      const { children } = asGroup(result.current);
      expect(children).toHaveLength(1);
      expect(children[0].id).toBe(AwxRoute.AutomationDashboard);
    });

    test('should keep only automation dashboard when activePlatformUser is null', () => {
      mockUsePlatformActiveUser.mockReturnValue({ activePlatformUser: null });
      const { result } = renderHook(() => useAutomationAnalytics());
      const { children } = asGroup(result.current);
      expect(children).toHaveLength(1);
      expect(children[0].id).toBe(AwxRoute.AutomationDashboard);
    });

    test('should keep only automation dashboard for non-superuser when managed cloud removes subscription usage first', () => {
      mockUseIsManagedCloudInstall.mockReturnValue(true);
      mockUsePlatformActiveUser.mockReturnValue({
        activePlatformUser: { is_superuser: false, is_platform_auditor: true },
      });
      const { result } = renderHook(() => useAutomationAnalytics());
      const { children } = asGroup(result.current);
      expect(children).toHaveLength(1);
      expect(children[0].id).toBe(AwxRoute.AutomationDashboard);
    });
  });

  // --- automationDashboardEnabled = false ---

  describe('when automationDashboardEnabled is false', () => {
    beforeEach(() => {
      mockUseAutomationDashboardCollectionStatus.mockReturnValue({ enabled: false });
    });

    test('should remove automation dashboard from children for superuser', () => {
      const { result } = renderHook(() => useAutomationAnalytics());
      const { children } = asGroup(result.current);
      expect(children.find((c) => c.id === AwxRoute.AutomationDashboard)).toBeUndefined();
    });

    test('should keep other children for superuser when dashboard is disabled', () => {
      const { result } = renderHook(() => useAutomationAnalytics());
      const { children } = asGroup(result.current);
      expect(children.map((c) => c.id)).toContain(AwxRoute.SubscriptionUsage);
      expect(children.map((c) => c.id)).toContain(AwxRoute.AutomationCalculator);
    });

    test('should be hidden when dashboard disabled and no other children remain', () => {
      // Only automation dashboard in the nav → after removal children.length = 0
      mockUseAwxNavigation.mockImplementation(() => [
        {
          id: AwxRoute.Analytics,
          label: 'Analytics',
          path: 'analytics',
          children: [
            {
              id: AwxRoute.AutomationDashboard,
              label: 'Automation Dashboard',
              path: 'automation-dashboard',
              element: <></>,
            },
          ],
        },
      ]);
      const { result } = renderHook(() => useAutomationAnalytics());
      expect(result.current.hidden).toBe(true);
    });

    test('should not remove automation dashboard from children for superuser when dashboard is enabled', () => {
      // Sanity: switching back to enabled keeps the dashboard
      mockUseAutomationDashboardCollectionStatus.mockReturnValue({ enabled: true });
      const { result } = renderHook(() => useAutomationAnalytics());
      const { children } = asGroup(result.current);
      expect(children.find((c) => c.id === AwxRoute.AutomationDashboard)).toBeDefined();
    });
  });

  // --- empty children guard ---

  test('should be hidden when analytics group has no children even for superuser', () => {
    mockUseAwxNavigation.mockImplementation(() => [
      {
        id: AwxRoute.Analytics,
        label: 'Analytics',
        path: 'analytics',
        children: [],
      },
    ]);
    const { result } = renderHook(() => useAutomationAnalytics());
    expect(result.current.hidden).toBe(true);
  });

  // --- analytics item not present in nav ---

  test('should return undefined when analytics item is not found in nav', () => {
    // Nav has no AwxRoute.Analytics node → removeNavigationItemById returns undefined
    mockUseAwxNavigation.mockImplementation(() => [
      { id: 'some-other-id', label: 'Other', path: 'other', element: <></> },
    ]);
    const { result } = renderHook(() => useAutomationAnalytics());
    // The if-block is skipped, the raw (undefined) value is returned
    expect(result.current).toBeUndefined();
  });

  // --- analytics is a leaf item (no children) ---

  test('should return item unchanged when analytics node has no children property', () => {
    const leafItem: PageNavigationItem = {
      id: AwxRoute.Analytics,
      label: 'Analytics',
      path: 'analytics',
      element: <></>,
    };
    mockUseAwxNavigation.mockImplementation(() => [leafItem]);
    const { result } = renderHook(() => useAutomationAnalytics());
    // if-block is skipped, no label/hidden mutation
    expect(result.current.label).toBe('Analytics');
    expect((result.current as { hidden?: boolean }).hidden).toBeUndefined();
  });

  // --- child without id in the filtering loop ---

  test('should skip children without id when enabled and user is non-superuser', () => {
    mockUsePlatformActiveUser.mockReturnValue({
      activePlatformUser: { is_superuser: false, is_platform_auditor: true },
    });
    mockUseAwxNavigation.mockImplementation(() => [
      {
        id: AwxRoute.Analytics,
        label: 'Analytics',
        path: 'analytics',
        children: [
          {
            id: AwxRoute.AutomationDashboard,
            label: 'Automation Dashboard',
            path: 'automation-dashboard',
            element: <></>,
          },
          {
            // No id — the `if (item.id)` guard should protect against this
            label: 'No-id item',
            path: 'no-id',
            element: <></>,
          },
          {
            id: AwxRoute.AutomationCalculator,
            label: 'Automation Calculator',
            path: 'automation-calculator',
            element: <></>,
          },
        ],
      },
    ]);
    const { result } = renderHook(() => useAutomationAnalytics());
    const { children } = asGroup(result.current);
    // AutomationDashboard kept; AutomationCalculator removed; no-id item stays (not removed)
    expect(children.find((c) => c.id === AwxRoute.AutomationDashboard)).toBeDefined();
    expect(children.find((c) => c.id === AwxRoute.AutomationCalculator)).toBeUndefined();
    expect(children.find((c) => !c.id)).toBeDefined();
  });

  // --- useIsManagedCloudInstall returns null (coalesces to false) ---

  test('should treat null managed cloud install as false and keep SubscriptionUsage', () => {
    mockUseIsManagedCloudInstall.mockReturnValue(null);
    const { result } = renderHook(() => useAutomationAnalytics());
    const { children } = asGroup(result.current);
    expect(children.find((c) => c.id === AwxRoute.SubscriptionUsage)).toBeDefined();
  });

  // --- automationDashboardEnabled = null (falsy, same branch as false) ---

  test('should remove automation dashboard when enabled is null', () => {
    mockUseAutomationDashboardCollectionStatus.mockReturnValue({ enabled: null });
    const { result } = renderHook(() => useAutomationAnalytics());
    const { children } = asGroup(result.current);
    expect(children.find((c) => c.id === AwxRoute.AutomationDashboard)).toBeUndefined();
  });
});
