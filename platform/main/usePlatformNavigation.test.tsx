/* eslint-disable i18next/no-literal-string */
import { PageNavigationItem } from '@ansible/ansible-ui-framework';
import { renderHook } from '@testing-library/react';
import { AwxRoute } from '@ansible/awx-ui/main/AwxRoutes';
import { EdaRoute } from '@ansible/eda-ui/main/EdaRoutes';
import { HubRoute } from '@ansible/hub-ui/main/HubRoutes';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { PlatformRoute } from './PlatformRoutes';
import { collectPageNavigationRouteIds } from '../test-utils/collectPageNavigationRoutes';
import { usePlatformNavigation } from './usePlatformNavigation';
import { gatewayAPI } from '../utils/gateway-api-utils';

const {
  mockUseAwxNavigation,
  mockUseEdaNavigation,
  mockUseHubNavigation,
  mockUseHasAwxService,
  mockUseHasEdaService,
  mockUseHasHubService,
  mockUsePlatformActiveUser,
  mockUseIsManagedCloudInstall,
  mockUsePersonaView,
  mockUseUIFlag,
  mockUseAwxActiveUser,
  mockUseAutomationDashboardCollectionStatus,
  mockUseRuntimeFeatureFlagsEnabled,
} = vi.hoisted(() => ({
  mockUseAwxNavigation: vi.fn(),
  mockUseEdaNavigation: vi.fn(),
  mockUseHubNavigation: vi.fn(),
  mockUseHasAwxService: vi.fn(() => true),
  mockUseHasEdaService: vi.fn(() => true),
  mockUseHasHubService: vi.fn(() => true),
  mockUsePlatformActiveUser: vi.fn(),
  mockUseIsManagedCloudInstall: vi.fn(() => false),
  mockUsePersonaView: vi.fn(() => ({ activePersonaViewId: 'administration' })),
  mockUseUIFlag: vi.fn(() => ({ enabled: false })),
  mockUseAwxActiveUser: vi.fn(() => ({ activeAwxUser: { is_superuser: true } })),
  mockUseAutomationDashboardCollectionStatus: vi.fn(() => ({
    collectionStatus: { enabled: true },
    isLoading: false,
  })),
  mockUseRuntimeFeatureFlagsEnabled: vi.fn(() => ({ isEnabled: false })),
}));

vi.mock('@ansible/awx-ui/main/useAwxNavigation', () => ({
  useAwxNavigation: mockUseAwxNavigation,
}));

vi.mock('@ansible/eda-ui/main/useEdaNavigation', () => ({
  useEdaNavigation: mockUseEdaNavigation,
}));

vi.mock('@ansible/hub-ui/main/useHubNavigation', () => ({
  useHubNavigation: mockUseHubNavigation,
}));

vi.mock('./GatewayServices', () => ({
  useHasAwxService: mockUseHasAwxService,
  useHasEdaService: mockUseHasEdaService,
  useHasHubService: mockUseHasHubService,
}));

vi.mock('./GatewayUIAuth', () => ({
  useIsManagedCloudInstall: mockUseIsManagedCloudInstall,
}));

vi.mock('./PlatformActiveUserProvider', () => ({
  usePlatformActiveUser: mockUsePlatformActiveUser,
}));

vi.mock('./persona-view/usePersonaView', () => ({
  usePersonaView: mockUsePersonaView,
}));

vi.mock('../settings/ui-flags/useUIFlag', () => ({
  useUIFlag: mockUseUIFlag,
}));

vi.mock('@ansible/awx-ui/common/useAwxActiveUser', () => ({
  useAwxActiveUser: mockUseAwxActiveUser,
}));

vi.mock(
  '../../frontend/awx/analytics/automation-dashboard/common/useAutomationDashboardCollectionStatus',
  () => ({
    useAutomationDashboardCollectionStatus: mockUseAutomationDashboardCollectionStatus,
  })
);

vi.mock('../settings/runtime-feature-flags/useRuntimeFeatureFlagsEnabled', () => ({
  useRuntimeFeatureFlagsEnabled: mockUseRuntimeFeatureFlagsEnabled,
}));

const server = setupServer(
  http.get(gatewayAPI`/app_urls/`, () => HttpResponse.json({ count: 0, results: [] }))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function buildAwxNav(): PageNavigationItem[] {
  return [
    {
      id: AwxRoute.Infrastructure,
      label: 'Infrastructure',
      path: 'infrastructure',
      children: [],
    },
    { id: AwxRoute.Credentials, label: 'Credentials', path: 'credentials', element: <></> },
    {
      id: AwxRoute.CredentialTypes,
      label: 'Credential types',
      path: 'credential-types',
      element: <></>,
    },
    { id: AwxRoute.Overview, label: 'Overview', path: 'overview', element: <></> },
    { id: AwxRoute.Settings, label: 'Settings', path: 'settings', element: <></> },
    { id: AwxRoute.Access, label: 'Access', path: 'access', element: <></> },
    {
      id: AwxRoute.Analytics,
      label: 'Analytics',
      path: 'analytics',
      children: [
        {
          id: 'awx-automation-dashboard',
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
      ],
    },
    { id: AwxRoute.Jobs, label: 'Jobs', path: 'jobs', element: <></> },
    { id: AwxRoute.Templates, label: 'Templates', path: 'templates', element: <></> },
    {
      id: AwxRoute.SettingsPreferences,
      label: 'Preferences',
      path: 'preferences',
      element: <></>,
    },
  ];
}

function buildEdaNav(): PageNavigationItem[] {
  return [
    { id: EdaRoute.Overview, label: 'Overview', path: 'overview', element: <></> },
    { id: EdaRoute.Credentials, label: 'Credentials', path: 'credentials', element: <></> },
    {
      id: EdaRoute.CredentialTypes,
      label: 'Credential types',
      path: 'credential-types',
      element: <></>,
    },
    { id: EdaRoute.Users, label: 'Users', path: 'users', element: <></> },
    { id: EdaRoute.Access, label: 'Access', path: 'access', element: <></> },
    { id: EdaRoute.Settings, label: 'Settings', path: 'settings', element: <></> },
  ];
}

function buildHubNav(): PageNavigationItem[] {
  return [
    { id: HubRoute.Overview, label: 'Overview', path: 'overview', element: <></> },
    { id: HubRoute.Organizations, label: 'Organizations', path: 'organizations', element: <></> },
    { id: HubRoute.Teams, label: 'Teams', path: 'teams', element: <></> },
    { id: HubRoute.Users, label: 'Users', path: 'users', element: <></> },
    { id: HubRoute.Settings, label: 'Settings', path: 'settings', element: <></> },
    { id: HubRoute.Access, label: 'Access', path: 'access', element: <></> },
    {
      id: 'hub-admin',
      label: 'Administration',
      path: 'administration',
      children: [{ id: 'hub-admin-child', label: 'Child', path: 'child', element: <></> }],
    },
  ];
}

function renderPlatformNavigation() {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter>{children}</MemoryRouter>
  );
  return renderHook(() => usePlatformNavigation(), { wrapper });
}

describe('usePlatformNavigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAwxNavigation.mockImplementation(() => buildAwxNav());
    mockUseEdaNavigation.mockImplementation(() => buildEdaNav());
    mockUseHubNavigation.mockImplementation(() => buildHubNav());
    mockUseHasAwxService.mockReturnValue(true);
    mockUseHasEdaService.mockReturnValue(true);
    mockUseHasHubService.mockReturnValue(true);
    mockUseIsManagedCloudInstall.mockReturnValue(false);
    mockUsePersonaView.mockReturnValue({ activePersonaViewId: 'administration' });
    mockUseUIFlag.mockReturnValue({ enabled: false });
    mockUseAwxActiveUser.mockReturnValue({ activeAwxUser: { is_superuser: true } });
    mockUseAutomationDashboardCollectionStatus.mockReturnValue({
      collectionStatus: { enabled: true },
      isLoading: false,
    });
    mockUseRuntimeFeatureFlagsEnabled.mockReturnValue({ isEnabled: false });
    mockUsePlatformActiveUser.mockReturnValue({
      activePlatformUser: { is_superuser: true, is_platform_auditor: false },
    });
  });

  test('should include core platform sections for a superuser', () => {
    const { result } = renderPlatformNavigation();
    const routeIds = collectPageNavigationRouteIds(result.current);

    expect(routeIds).toEqual(
      expect.arrayContaining([
        PlatformRoute.Overview,
        PlatformRoute.AWX,
        PlatformRoute.EDA,
        PlatformRoute.HUB,
        PlatformRoute.Access,
        PlatformRoute.PlatformResources,
        PlatformRoute.QuickStarts,
        PlatformRoute.Root,
      ])
    );
  });

  test('should hide quickstarts on managed cloud installs', () => {
    mockUseIsManagedCloudInstall.mockReturnValue(true);
    const { result } = renderPlatformNavigation();
    const routeIds = collectPageNavigationRouteIds(result.current);

    expect(routeIds).not.toContain(PlatformRoute.QuickStarts);
  });

  test('should include access management child routes from platform route hooks', () => {
    const { result } = renderPlatformNavigation();
    const routeIds = collectPageNavigationRouteIds(result.current);

    expect(routeIds).toEqual(
      expect.arrayContaining([
        PlatformRoute.Users,
        PlatformRoute.Teams,
        PlatformRoute.Organizations,
        PlatformRoute.Authenticators,
        PlatformRoute.Roles,
        PlatformRoute.Applications,
      ])
    );
  });
});
