import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  PageNavigationItem,
  findNavigationItemById,
  removeNavigationItemById,
} from '../../framework';
import { AwxSettingsCategoryDetailsPage } from '../../frontend/awx/administration/settings/AwxSettingsCategoryDetails';
import { AwxSettingsCategoryForm } from '../../frontend/awx/administration/settings/AwxSettingsCategoryForm';
import { AwxRoute } from '../../frontend/awx/main/AwxRoutes';
import { useAwxNavigation } from '../../frontend/awx/main/useAwxNavigation';
import { EdaRoute } from '../../frontend/eda/main/EdaRoutes';
import { useEdaNavigation } from '../../frontend/eda/main/useEdaNavigation';
import { HubRoute } from '../../frontend/hub/main/HubRoutes';
import { useHubNavigation } from '../../frontend/hub/main/useHubNavigation';
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
import { useHasAwxService, useHasEdaService, useHasHubService } from './GatewayServices';
import { useIsManagedCloudInstall } from './GatewayUIAuth';
import { usePlatformActiveUser } from './PlatformActiveUserProvider';
import { PlatformRoute } from './PlatformRoutes';
import { Redirect } from './Redirect';
import { PageSettingsForm } from '../../framework/PageSettings/PageSettingsForm';
import { PageSettingsDetails } from '../../framework/PageSettings/PageSettingsDetails';

export function usePlatformNavigation() {
  const { t } = useTranslation();

  const awxService = useHasAwxService();
  const edaService = useHasEdaService();
  const hubService = useHasHubService();

  const awxNav = useAwxNavigation();
  const edaNav = useEdaNavigation();
  const hubNav = useHubNavigation();

  const organizations = useGetPlatformOrganizationsRoutes();
  const teams = useGetPlatformTeamsRoutes();
  const users = useGetPlatformUsersRoutes();
  const roles = useGetPlatformRolesRoutes();
  const applications = useGetPlatformApplicationsRoutes();
  const authenticators = useGetPlatformAuthenticatorsRoutes();
  const resources = useGetPlatformResourceRoutes();

  const navigate = useNavigate();
  const { activePlatformUser } = usePlatformActiveUser();
  const managedCloudInstall = useIsManagedCloudInstall() ?? false;

  const pageNavigationItems = useMemo<PageNavigationItem[]>(() => {
    removeNavigationItemById(awxNav, AwxRoute.Overview);
    removeNavigationItemById(awxNav, AwxRoute.Settings);
    const awxInfrastructure = findNavigationItemById(awxNav, AwxRoute.Infrastructure);
    const awxCredentials = removeNavigationItemById(awxNav, AwxRoute.Credentials)!;
    const awxCredentialTypes = removeNavigationItemById(awxNav, AwxRoute.CredentialTypes)!;
    if (awxInfrastructure && 'children' in awxInfrastructure) {
      awxInfrastructure.children.push(awxCredentials);
      awxInfrastructure.children.push(awxCredentialTypes);
    }

    // HERE
    removeNavigationItemById(awxNav, AwxRoute.Access);
    removeNavigationItemById(awxNav, AwxRoute.Applications);

    removeNavigationItemById(edaNav, EdaRoute.Overview);
    removeNavigationItemById(edaNav, EdaRoute.Users);

    const edaCredentials = removeNavigationItemById(edaNav, EdaRoute.Credentials)!;
    const edaCredentialTypes = removeNavigationItemById(edaNav, EdaRoute.CredentialTypes)!;
    removeNavigationItemById(edaNav, EdaRoute.Access);
    edaNav.push({
      id: 'eda-infrastructure',
      label: t('Infrastructure'),
      path: 'infrastructure',
      children: [edaCredentials, edaCredentialTypes],
    });
    removeNavigationItemById(edaNav, EdaRoute.Settings);

    removeNavigationItemById(hubNav, HubRoute.Overview);
    removeNavigationItemById(hubNav, HubRoute.Organizations);
    removeNavigationItemById(hubNav, HubRoute.Teams);
    removeNavigationItemById(hubNav, HubRoute.Users);
    removeNavigationItemById(hubNav, HubRoute.Settings);

    // TODO - create token page for all 3 and put in access
    // hubAdministration!.childrenhubNav.push(removeNavigationItemById(hubNav, HubRoute.APIToken)!);
    // const hubApiTokenRoute = removeNavigationItemById(hubNav, HubRoute.APIToken)!;
    // hubApiTokenRoute.label = t('Content API Token');
    removeNavigationItemById(hubNav, HubRoute.Access);

    // inline hub admin menu, preserving paths
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

    const navigationItems: PageNavigationItem[] = [];
    navigationItems.push({
      id: PlatformRoute.Overview,
      label: t('Overview'),
      path: 'overview',
      element: <PlatformOverview />,
    });
    navigationItems.push({
      id: PlatformRoute.AWX,
      label: t('Automation Execution'),
      subtitle: t('Automation Controller'),
      path: 'execution',
      children: awxNav,
      hidden: !awxService,
    });
    navigationItems.push({
      id: PlatformRoute.EDA,
      label: t('Automation Decisions'),
      subtitle: t('Event-Driven Ansible'),
      path: 'decisions',
      children: edaNav,
      hidden: !edaService,
    });
    navigationItems.push({
      id: PlatformRoute.HUB,
      label: t('Automation Content'),
      subtitle: t('Automation Hub'),
      hidden: !hubService,
      path: 'content',
      children: hubNav,
    });

    const analytics = removeNavigationItemById(awxNav, AwxRoute.Analytics);
    if (analytics && 'children' in analytics) {
      analytics.label = t('Automation Analytics');
      analytics.hidden = !awxService;
      managedCloudInstall
        ? removeNavigationItemById(analytics.children, AwxRoute.SubscriptionUsage)
        : null;
      navigationItems.push(analytics);
    }

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

    navigationItems.push({
      id: PlatformRoute.Access,
      label: t('Access Management'),
      path: 'access',
      children: platformAccessRouteChildren,
    });
    navigationItems.push({
      id: PlatformRoute.Lightspeed,
      label: t('Ansible Lightspeed'),
      path: 'lightspeed',
      element: <Lightspeed />,
    });
    navigationItems.push({
      id: PlatformRoute.QuickStarts,
      // label: t('QuickStarts'),
      path: 'quickstarts',
      element: <QuickStartsPage />,
    });
    if (activePlatformUser?.is_superuser || activePlatformUser?.is_platform_auditor) {
      navigationItems.push({
        id: AwxRoute.Settings,
        label: t('Settings'),
        path: 'settings',
        children: [
          {
            label: t('Subscription'),
            path: 'subscription',
            children: [
              {
                id: PlatformRoute.SubscriptionWizard,
                path: 'wizard',
                element: (
                  <SubscriptionWizard onSuccess={() => navigate('/settings/subscription')} />
                ),
              },
              {
                id: PlatformRoute.SubscriptionDetails,
                path: '',
                element: <SubscriptionDetails />,
              },
            ],
          },
          {
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
          },
          {
            id: AwxRoute.SettingsPreferences,
            label: t('User Preferences'),
            path: 'preferences',
            children: [
              {
                path: 'edit',
                element: <PageSettingsForm />,
              },
              {
                path: '',
                element: <PageSettingsDetails />,
              },
            ],
          },
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
          },
          // {
          //   id: AwxRoute.SettingsCustomizeLogin,
          //   label: t('Customize Login'),
          //   path: 'customize-login',
          //   element: <AwxSettingsCategory categoryId="ui" key="ui" />,
          // },
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
          },
          {
            path: '',
            element: <Navigate to=".." />,
          },
        ],
      });
    }
    navigationItems.push(resources);
    navigationItems.push({
      path: 'redirect',
      element: <Redirect />,
    });
    navigationItems.push({
      id: PlatformRoute.Root,
      path: '',
      element: <Navigate to="overview" />,
    });
    return navigationItems;
  }, [
    awxNav,
    edaNav,
    t,
    hubNav,
    awxService,
    edaService,
    hubService,
    organizations,
    teams,
    users,
    activePlatformUser?.is_superuser,
    activePlatformUser?.is_platform_auditor,
    resources,
    managedCloudInstall,
    authenticators,
    roles,
    applications,
    navigate,
  ]);
  return pageNavigationItems;
}
