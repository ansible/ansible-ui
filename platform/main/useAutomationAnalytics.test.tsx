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
} = vi.hoisted(() => ({
  mockUseAwxNavigation: vi.fn(),
  mockUseHasAwxService: vi.fn(),
  mockUseIsManagedCloudInstall: vi.fn(),
  mockUsePlatformActiveUser: vi.fn(),
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
    mockUsePlatformActiveUser.mockReturnValue({
      activePlatformUser: { is_superuser: true, is_platform_auditor: false },
    });
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
    mockUsePlatformActiveUser.mockReturnValue({
      activePlatformUser: { is_superuser: true, is_platform_auditor: false },
    });
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
    mockUseIsManagedCloudInstall.mockReturnValue(false);
    const { result } = renderHook(() => useAutomationAnalytics());
    const { children } = asGroup(result.current);
    expect(children.find((c) => c.id === AwxRoute.SubscriptionUsage)).toBeDefined();
  });

  // --- non-superuser children filtering ---

  test('should preserve all children for superuser', () => {
    // Arrange: 3 children (dashboard + subscription-usage + calculator), is_superuser = true
    const { result } = renderHook(() => useAutomationAnalytics());
    const { children } = asGroup(result.current);
    expect(children).toHaveLength(3);
    expect(children.map((c) => c.id)).toContain(AwxRoute.AutomationDashboard);
    expect(children.map((c) => c.id)).toContain(AwxRoute.SubscriptionUsage);
    expect(children.map((c) => c.id)).toContain(AwxRoute.AutomationCalculator);
  });

  test('should keep only automation dashboard for non-superuser', () => {
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

  test('should keep only automation dashboard for non-superuser even when managed cloud removes subscription usage first', () => {
    mockUseIsManagedCloudInstall.mockReturnValue(true);
    mockUsePlatformActiveUser.mockReturnValue({
      activePlatformUser: { is_superuser: false, is_platform_auditor: true },
    });
    // Arrange: managed cloud removes subscription-usage first (2 children left),
    // then non-superuser filter removes everything except the dashboard (1 child).
    const { result } = renderHook(() => useAutomationAnalytics());
    const { children } = asGroup(result.current);
    expect(children).toHaveLength(1);
    expect(children[0].id).toBe(AwxRoute.AutomationDashboard);
  });

  // --- !analytics.children.length condition ---

  test('should be hidden when analytics group has no children even for superuser', () => {
    mockUseAwxNavigation.mockImplementation(() => [
      {
        id: AwxRoute.Analytics,
        label: 'Analytics',
        path: 'analytics',
        children: [],
      },
    ]);
    // superuser + awxService pass the first two hidden guards,
    // but !analytics.children.length must still hide the item
    const { result } = renderHook(() => useAutomationAnalytics());
    expect(result.current.hidden).toBe(true);
  });

  test('should not be hidden when analytics group has children for superuser', () => {
    // Sanity-check: a non-empty children list does not trigger the length guard
    const { result } = renderHook(() => useAutomationAnalytics());
    expect(result.current.hidden).toBe(false);
  });

  // --- activePlatformUser null / undefined ---

  test('should be hidden when activePlatformUser is null', () => {
    mockUsePlatformActiveUser.mockReturnValue({ activePlatformUser: null });
    const { result } = renderHook(() => useAutomationAnalytics());
    expect(result.current.hidden).toBe(true);
  });

  test('should keep only automation dashboard when activePlatformUser is null', () => {
    mockUsePlatformActiveUser.mockReturnValue({ activePlatformUser: null });
    const { result } = renderHook(() => useAutomationAnalytics());
    const { children } = asGroup(result.current);
    expect(children).toHaveLength(1);
    expect(children[0].id).toBe(AwxRoute.AutomationDashboard);
  });
});
