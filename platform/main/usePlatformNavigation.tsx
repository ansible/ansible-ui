import {
  PageNavigationItem,
  findNavigationItemById,
  removeNavigationItemById,
} from '@ansible/ansible-ui-framework';
import { PageSettingsDetails } from '@ansible/ansible-ui-framework/PageSettings/PageSettingsDetails';
import { PageSettingsForm } from '@ansible/ansible-ui-framework/PageSettings/PageSettingsForm';
import { AwxPolicySettingsDetailsPage } from '@ansible/awx-ui/administration/settings/AwxPolicySettingsDetails';
import { AwxSettingsCategoryDetailsPage } from '@ansible/awx-ui/administration/settings/AwxSettingsCategoryDetails';
import { AwxSettingsCategoryForm } from '@ansible/awx-ui/administration/settings/AwxSettingsCategoryForm';
import { PolicySettingsCategoryForm } from '@ansible/awx-ui/administration/settings/PolicySettingsEdit';
import { AwxItemsResponse } from '@ansible/awx-ui/common/AwxItemsResponse';
import { useAwxActiveUser } from '@ansible/awx-ui/common/useAwxActiveUser';
import { useFeatureFlag } from '@ansible/awx-ui/common/useFeatureFlags';
import { Application } from '@ansible/awx-ui/interfaces/Application';
import { AwxRoute } from '@ansible/awx-ui/main/AwxRoutes';
import { useAwxNavigation } from '@ansible/awx-ui/main/useAwxNavigation';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { EdaRoute } from '@ansible/eda-ui/main/EdaRoutes';
import { useEdaNavigation } from '@ansible/eda-ui/main/useEdaNavigation';
import { HubRoute } from '@ansible/hub-ui/main/HubRoutes';
import { useHubNavigation } from '@ansible/hub-ui/main/useHubNavigation';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate } from 'react-router-dom';
import { Lightspeed } from '../lightspeed/Lightspeed';
import { PlatformOverview } from '../overview/PlatformOverview';
import { QuickStartsPage } from '../overview/quickstarts/Quickstarts';
import { useGetPlatformApplicationsRoutes } from '../routes/useGetPlatformApplicationsRoutes';
import { useGetPlatformAuthenticatorsRoutes } from '../routes/useGetPlatformAuthenticatorsRoutes';
import { useGetPlatformOrganizationsRoutes } from '../routes/useGetPlatformOrganizationsRoutes';
import { useGetPlatformResourceRoutes } from '../routes/useGetPlatformResourceRoutes';
import { useGetPlatformRolesRoutes } from '../routes/useGetPlatformRolesRoutes';
import { useGetPlatformTeamsRoutes } from '../routes/useGetPlatformTeamsRoutes';
import { useGetPlatformUsersRoutes } from '../routes/useGetPlatformUsersRoutes';
import { GatewaySettings } from '../settings/GatewaySettings';
import { GatewaySettingsDetails } from '../settings/GatewaySettingsDetails';
import { GatewaySettingsEdit } from '../settings/GatewaySettingsEdit';
import { SubscriptionDetails } from '../settings/SubscriptionDetails';
import { SubscriptionWizard } from '../settings/SubscriptionWizard';
import { UIFlag } from '../settings/ui-flags/IUIFlag';
import { UIFlagsPage } from '../settings/ui-flags/UIFlagsPage';
import { useUIFlag } from '../settings/ui-flags/useUIFlag';
import { gatewayAPI } from '../utils/gateway-api-utils';
import { useHasAwxService, useHasEdaService, useHasHubService } from './GatewayServices';
import { useIsManagedCloudInstall } from './GatewayUIAuth';
import { usePlatformActiveUser } from './PlatformActiveUserProvider';
import { PlatformRoute } from './PlatformRoutes';
import { Redirect } from './Redirect';
import { usePersonaView } from './persona-view/usePersonaView';

export function usePlatformNavigation() {
  const { t } = useTranslation();

  const automationExecutionNavigation = useAutomationExecutionNavigation();
  const automationDecisionsNavigation = useAutomationDecisionsNavigation();
  const automationAnalytics = useAutomationAnalytics();
  const automationContentNavigation = useAutomationContentNavigation();
  const platformAccessNavigation = usePlatformAccessNavigation();
  const platformSettingsNavigation = usePlatformSettingsNavigation();
  const platformResourcesNavigation = useGetPlatformResourceRoutes();

  const { data: oauthApplications } = useGet<AwxItemsResponse<Application>>(gatewayAPI`/app_urls/`);

  let { activePersonaViewId } = usePersonaView();
  const personaViewSwitcherFlag = useUIFlag(UIFlag.PersonaViewSwitcher);
  if (!personaViewSwitcherFlag?.enabled) {
    activePersonaViewId = 'administration';
  }

  const { activeAwxUser } = useAwxActiveUser();

  const managedCloudInstall = useIsManagedCloudInstall() ?? false;

  const pageNavigationItems = useMemo<PageNavigationItem[]>(() => {
    const navigationItems: PageNavigationItem[] = [];

    // Overview
    const overviewNavigation: PageNavigationItem = {
      id: PlatformRoute.Overview,
      label: t('Overview'),
      path: 'overview',
      element: <PlatformOverview />,
    };
    navigationItems.push(overviewNavigation);

    // Automation Execution
    navigationItems.push(automationExecutionNavigation);

    // Automation Decisions
    navigationItems.push(automationDecisionsNavigation);

    // Automation Analytics
    if (automationAnalytics) navigationItems.push(automationAnalytics);

    // Automation Content
    navigationItems.push(automationContentNavigation);

    if (oauthApplications && oauthApplications.results.length > 0) {
      const appsWithLinks = oauthApplications.results
        .filter((app) => !!app.app_url)
        .filter((app, index, self) => {
          return self.findIndex((a) => a.name === app.name && a.app_url === app.app_url) === index;
        })
        .sort((a, b) => a.name.localeCompare(b.name));
      if (appsWithLinks.length > 0) {
        navigationItems.push({
          id: PlatformRoute.ApplicationLinks,
          label: t('Application Links'),
          path: 'links',
          children: oauthApplications.results.map((app) => ({
            label: app.name,
            href: app.app_url,
            path: '',
            element: <></>,
          })),
        });
      }
    }

    // Lightspeed
    const lightspeedApplication = oauthApplications?.results.find((app) =>
      app.name.toLocaleLowerCase().includes('lightspeed')
    );
    if (!lightspeedApplication || !lightspeedApplication.app_url) {
      navigationItems.push({
        id: PlatformRoute.Lightspeed,
        label: t('Ansible Lightspeed'),
        path: 'lightspeed',
        element: <Lightspeed />,
      });
    }

    // Access
    navigationItems.push(platformAccessNavigation);

    // Settings
    navigationItems.push(platformSettingsNavigation);

    // QuickStarts
    if (!managedCloudInstall) {
      navigationItems.push({
        id: PlatformRoute.QuickStarts,
        label: t('QuickStarts'),
        path: 'quickstarts',
        element: <QuickStartsPage />,
      });
    }

    // Platform Resources - Handles redirects from links to platform resources
    navigationItems.push(platformResourcesNavigation);

    // OAuth Redirect
    navigationItems.push({
      path: 'redirect',
      element: <Redirect />,
    });

    // Root - Redirect to Overview
    navigationItems.push({
      id: PlatformRoute.Root,
      path: '',
      element: <Navigate to="overview" />,
    });

    switch (activePersonaViewId) {
      case 'operator': {
        findNavigationItemById(navigationItems, PlatformRoute.AWX)!.hidden = true;
        findNavigationItemById(navigationItems, PlatformRoute.EDA)!.hidden = true;
        findNavigationItemById(navigationItems, PlatformRoute.HUB)!.hidden = true;
        if (activeAwxUser?.is_superuser || activeAwxUser?.is_system_auditor) {
          removeNavigationItemById(navigationItems, AwxRoute.Analytics);
        }
        findNavigationItemById(navigationItems, PlatformRoute.Lightspeed)!.hidden = true;
        findNavigationItemById(navigationItems, PlatformRoute.Access)!.hidden = true;
        findNavigationItemById(navigationItems, AwxRoute.Settings)!.hidden = true;
        navigationItems.push(removeNavigationItemById(navigationItems, AwxRoute.Jobs)!);
        navigationItems.push(removeNavigationItemById(navigationItems, AwxRoute.Templates)!);
        navigationItems.push(removeNavigationItemById(navigationItems, AwxRoute.Credentials)!);
        navigationItems.push(
          removeNavigationItemById(navigationItems, AwxRoute.SettingsPreferences)!
        );
        removeNavigationItemById(navigationItems, PlatformRoute.Overview);
        removeNavigationItemById(navigationItems, PlatformRoute.Root);
        navigationItems.push({
          id: PlatformRoute.Root,
          path: '',
          element: <Navigate to="jobs" />,
        });

        const links = removeNavigationItemById(navigationItems, PlatformRoute.ApplicationLinks);
        if (links) {
          navigationItems.push(links);
        }

        const quickstarts = removeNavigationItemById(navigationItems, PlatformRoute.QuickStarts);
        if (quickstarts) {
          navigationItems.push(quickstarts);
        }
        break;
      }
    }

    return navigationItems;
  }, [
    t,
    automationExecutionNavigation,
    automationDecisionsNavigation,
    automationAnalytics,
    automationContentNavigation,
    oauthApplications,
    platformAccessNavigation,
    platformSettingsNavigation,
    managedCloudInstall,
    platformResourcesNavigation,
    activePersonaViewId,
    activeAwxUser?.is_superuser,
    activeAwxUser?.is_system_auditor,
  ]);

  return pageNavigationItems;
}

function useAutomationExecutionNavigation(): PageNavigationItem {
  const { t } = useTranslation();
  const awxNav = useAwxNavigation();
  const awxService = useHasAwxService();

  // Move credentials and credential types under infrastructure
  const awxInfrastructure = findNavigationItemById(awxNav, AwxRoute.Infrastructure);
  const awxCredentials = removeNavigationItemById(awxNav, AwxRoute.Credentials)!;
  const awxCredentialTypes = removeNavigationItemById(awxNav, AwxRoute.CredentialTypes)!;
  if (awxInfrastructure && 'children' in awxInfrastructure) {
    awxInfrastructure.children.push(awxCredentials);
    awxInfrastructure.children.push(awxCredentialTypes);
  }

  // Remove AWX items that are handled by the platform
  removeNavigationItemById(awxNav, AwxRoute.Overview);
  removeNavigationItemById(awxNav, AwxRoute.Settings);
  removeNavigationItemById(awxNav, AwxRoute.Access);
  removeNavigationItemById(awxNav, AwxRoute.Analytics);

  return {
    id: PlatformRoute.AWX,
    label: t('Automation Execution'),
    subtitle: t('Automation Controller'),
    path: 'execution',
    children: awxNav,
    hidden: !awxService,
  };
}

function useAutomationDecisionsNavigation(): PageNavigationItem {
  const { t } = useTranslation();
  const edaNav = useEdaNavigation();
  const edaService = useHasEdaService();

  // Move credentials and credential types under infrastructure
  const edaCredentials = removeNavigationItemById(edaNav, EdaRoute.Credentials)!;
  const edaCredentialTypes = removeNavigationItemById(edaNav, EdaRoute.CredentialTypes)!;
  edaNav.push({
    id: 'eda-infrastructure',
    label: t('Infrastructure'),
    path: 'infrastructure',
    children: [edaCredentials, edaCredentialTypes],
  });

  // Remove EDA items that are handled by the platform
  removeNavigationItemById(edaNav, EdaRoute.Overview);
  removeNavigationItemById(edaNav, EdaRoute.Users);
  removeNavigationItemById(edaNav, EdaRoute.Access);
  removeNavigationItemById(edaNav, EdaRoute.Settings);

  return {
    id: PlatformRoute.EDA,
    label: t('Automation Decisions'),
    subtitle: t('Event-Driven Ansible'),
    path: 'decisions',
    children: edaNav,
    hidden: !edaService,
  };
}

function useAutomationAnalytics(): PageNavigationItem {
  const awxNav = useAwxNavigation();
  const { t } = useTranslation();
  const awxService = useHasAwxService();
  const managedCloudInstall = useIsManagedCloudInstall() ?? false;
  const analytics = removeNavigationItemById(awxNav, AwxRoute.Analytics)!;
  const { activePlatformUser } = usePlatformActiveUser();
  if (analytics && 'children' in analytics) {
    analytics.label = t('Automation Analytics');
    if (managedCloudInstall) {
      removeNavigationItemById(analytics.children, AwxRoute.SubscriptionUsage);
    }
    analytics.hidden = !awxService || !activePlatformUser?.is_superuser;
  }
  return analytics;
}

function useAutomationContentNavigation(): PageNavigationItem {
  const { t } = useTranslation();
  const hubNav = useHubNavigation();
  const hubService = useHasHubService();

  const hubAdminIndex = hubNav.findIndex(({ path }) => path === 'administration');
  if (hubAdminIndex !== -1) {
    // as PageNavigationGroup really, but not exported
    const admin = hubNav[hubAdminIndex] as { children: PageNavigationItem[] };
    const children = admin.children.map((o) => ({
      ...o,
      path: `administration/${o.path}`,
    }));
    hubNav.splice(hubAdminIndex, 1, ...children);
  }

  // Remove Hub items that are handled by the platform
  removeNavigationItemById(hubNav, HubRoute.Overview);
  removeNavigationItemById(hubNav, HubRoute.Organizations);
  removeNavigationItemById(hubNav, HubRoute.Teams);
  removeNavigationItemById(hubNav, HubRoute.Users);
  removeNavigationItemById(hubNav, HubRoute.Settings);
  removeNavigationItemById(hubNav, HubRoute.Access);

  return {
    id: PlatformRoute.HUB,
    label: t('Automation Content'),
    subtitle: t('Automation Hub'),
    path: 'content',
    children: hubNav,
    hidden: !hubService,
  };
}

function usePlatformAccessNavigation(): PageNavigationItem {
  const { t } = useTranslation();
  const { activePlatformUser } = usePlatformActiveUser();
  const authenticators = useGetPlatformAuthenticatorsRoutes();
  const organizations = useGetPlatformOrganizationsRoutes();
  const teams = useGetPlatformTeamsRoutes();
  const users = useGetPlatformUsersRoutes();
  const roles = useGetPlatformRolesRoutes();
  const applications = useGetPlatformApplicationsRoutes();
  const awxService = useHasAwxService();
  const edaService = useHasEdaService();
  const hubService = useHasHubService();
  const platformAccessRouteChildren = [organizations, teams, users];

  if (activePlatformUser?.is_superuser || activePlatformUser?.is_platform_auditor) {
    platformAccessRouteChildren.unshift(authenticators);
  }

  if (awxService || edaService || hubService) {
    platformAccessRouteChildren.push(...roles);
  }

  if (activePlatformUser?.is_superuser || activePlatformUser?.is_platform_auditor) {
    platformAccessRouteChildren.push(...applications);
  }
  return {
    id: PlatformRoute.Access,
    label: t('Access Management'),
    path: 'access',
    children: platformAccessRouteChildren,
  };
}

function usePlatformSettingsNavigation(): PageNavigationItem {
  const { t } = useTranslation();
  const settingsNav: PageNavigationItem[] = [];
  const { activePlatformUser } = usePlatformActiveUser();
  const awxService = useHasAwxService();
  const navigate = useNavigate();
  const hasPolicyAsCode = useFeatureFlag('FEATURE_POLICY_AS_CODE_ENABLED');

  settingsNav.push({
    label: t('Subscription'),
    path: 'subscription',
    children: [
      {
        id: PlatformRoute.SubscriptionWizard,
        path: 'wizard',
        element: <SubscriptionWizard onSuccess={() => navigate('/settings/subscription')} />,
      },
      {
        id: PlatformRoute.SubscriptionDetails,
        path: '',
        element: <SubscriptionDetails />,
      },
    ],
    hidden:
      !awxService ||
      (!activePlatformUser?.is_superuser && !activePlatformUser?.is_platform_auditor),
  });

  settingsNav.push({
    id: PlatformRoute.GatewaySettings,
    label: t('Platform gateway'),
    path: 'platform-gateway',
    element: <GatewaySettings />,
    children: [
      {
        path: 'edit',
        element: <GatewaySettingsEdit categoryId="platform" />,
      },
      {
        path: '',
        element: <GatewaySettingsDetails categoryId="platform" />,
      },
    ],
    hidden: !activePlatformUser?.is_superuser && !activePlatformUser?.is_platform_auditor,
  });

  const userPreferences = {
    id: AwxRoute.SettingsPreferences,
    label: t('User Preferences'),
    path: 'preferences',
    children: [
      { path: 'edit', element: <PageSettingsForm /> },
      { path: '', element: <PageSettingsDetails /> },
    ],
  };
  settingsNav.push(userPreferences);

  settingsNav.push({
    id: PlatformRoute.PlatformControllerSettings,
    label: t('Automation Execution'),
    path: 'automation-execution',
    children: [
      {
        id: AwxRoute.SettingsSystem,
        label: t('System'),
        path: 'system',
        children: [
          {
            path: 'edit',
            element: <AwxSettingsCategoryForm categoryId="system" key="system" />,
          },
          {
            path: '',
            element: <AwxSettingsCategoryDetailsPage categoryId="system" key="system" />,
          },
        ],
        hidden:
          !awxService ||
          (!activePlatformUser?.is_superuser && !activePlatformUser?.is_platform_auditor),
      },
      {
        id: AwxRoute.SettingsJobs,
        label: t('Job'),
        path: 'job-settings',
        children: [
          {
            path: 'edit',
            element: <AwxSettingsCategoryForm categoryId="jobs" key="jobs" />,
          },
          {
            path: '',
            element: <AwxSettingsCategoryDetailsPage categoryId="jobs" key="jobs" />,
          },
        ],
        hidden:
          !awxService ||
          (!activePlatformUser?.is_superuser && !activePlatformUser?.is_platform_auditor),
      },
      {
        id: AwxRoute.SettingsLogging,
        label: t('Logging'),
        path: 'logging',
        children: [
          {
            path: 'edit',
            element: <AwxSettingsCategoryForm categoryId="logging" key="logging" />,
          },
          {
            path: '',
            element: <AwxSettingsCategoryDetailsPage categoryId="logging" key="logging" />,
          },
        ],
        hidden:
          !awxService ||
          (!activePlatformUser?.is_superuser && !activePlatformUser?.is_platform_auditor),
      },
      ...(hasPolicyAsCode
        ? [
            {
              id: AwxRoute.SettingsPolicy,
              label: t('Policy'),
              path: 'policy-settings',
              children: [
                {
                  path: 'edit',
                  element: <PolicySettingsCategoryForm />,
                },
                {
                  path: '',
                  element: <AwxPolicySettingsDetailsPage />,
                },
              ],
            },
          ]
        : []),
      {
        id: AwxRoute.SettingsTroubleshooting,
        label: t('Troubleshooting'),
        path: 'troubleshooting',
        children: [
          {
            path: 'edit',
            element: <AwxSettingsCategoryForm categoryId="debug" key="debug" />,
          },
          {
            path: '',
            element: <AwxSettingsCategoryDetailsPage categoryId="debug" key="debug" />,
          },
        ],
        hidden:
          !awxService ||
          (!activePlatformUser?.is_superuser && !activePlatformUser?.is_platform_auditor),
      },
    ],
  });

  settingsNav.push({
    id: PlatformRoute.DeveloperSettings,
    label: t('Development'),
    path: 'dev',
    hidden: process.env.NODE_ENV !== 'development',
    children: [
      {
        id: PlatformRoute.UIFlags,
        label: t('UI Flags'),
        path: 'flags',
        element: <UIFlagsPage />,
      },
    ],
  });

  settingsNav.push({
    path: '',
    element: <Navigate to=".." />,
  });

  return {
    id: AwxRoute.Settings,
    label: t('Settings'),
    path: 'settings',
    children: settingsNav,
  };
}
