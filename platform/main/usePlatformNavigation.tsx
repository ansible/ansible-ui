import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  PageNavigationItem,
  findNavigationItemById,
  removeNavigationItemById,
} from '../../framework';
import { PageSettings } from '../../framework/PageSettings/PageSettings';
import { AwxSettingsCategoryDetailsPage } from '../../frontend/awx/administration/settings/AwxSettingsCategoryDetails';
import { AwxSettingsCategoryForm } from '../../frontend/awx/administration/settings/AwxSettingsCategoryForm';
import { AwxRoute } from '../../frontend/awx/main/AwxRoutes';
import { useAwxNavigation } from '../../frontend/awx/main/useAwxNavigation';
import { EdaRoute } from '../../frontend/eda/main/EdaRoutes';
import { useEdaNavigation } from '../../frontend/eda/main/useEdaNavigation';
import { HubRoute } from '../../frontend/hub/main/HubRoutes';
import { useHubNavigation } from '../../frontend/hub/main/useHubNavigation';
import { PlatformAwxRoles } from '../access/roles/PlatformAwxRoles';
import { PlatformEdaRoles } from '../access/roles/PlatformEdaRoles';
import { PlatformHubRoles } from '../access/roles/PlatformHubRoles';
import { PlatformRoles } from '../access/roles/PlatformRoles';
import { Lightspeed } from '../lightspeed/Lightspeed';
import { PlatformOverview } from '../overview/PlatformOverview';
import { QuickStartsPage } from '../overview/quickstarts/Quickstarts';
import { useGetPlatformAuthenticatorsRoutes } from '../routes/useGetPlatformAuthenticatorsRoutes';
import { useGetPlatformOrganizationsRoutes } from '../routes/useGetPlatformOrganizationsRoutes';
import { useGetPlatformTeamsRoutes } from '../routes/useGetPlatformTeamsRoutes';
import { useGetPlatformUsersRoutes } from '../routes/useGetPlatformUsersRoutes';
import { SubscriptionDetails } from '../settings/SubscriptionDetails';
import { SubscriptionWizard } from '../settings/SubscriptionWizard';
import { useAwxService, useEdaService, useHubService } from './GatewayServices';
import { PlatformRoute } from './PlatformRoutes';
import { Redirect } from './Redirect';

export function usePlatformNavigation() {
  const { t } = useTranslation();

  const awxService = useAwxService();
  const edaService = useEdaService();
  const hubService = useHubService();

  const awxNav = useAwxNavigation();
  const edaNav = useEdaNavigation();
  const hubNav = useHubNavigation();

  const organizations = useGetPlatformOrganizationsRoutes();
  const teams = useGetPlatformTeamsRoutes();
  const users = useGetPlatformUsersRoutes();
  const authenticators = useGetPlatformAuthenticatorsRoutes();

  const navigate = useNavigate();

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

    const awxRolesRoute = removeNavigationItemById(awxNav, AwxRoute.Roles);
    if (awxRolesRoute && 'children' in awxRolesRoute) {
      const edaRoles = awxRolesRoute.children.find((r) => r.path === '');
      if (edaRoles && 'element' in edaRoles) {
        edaRoles.element = <PlatformAwxRoles />;
      }
      awxRolesRoute.label = undefined;
      awxRolesRoute.path = 'execution';
    }
    removeNavigationItemById(awxNav, AwxRoute.Access);

    removeNavigationItemById(edaNav, EdaRoute.Overview);
    removeNavigationItemById(edaNav, EdaRoute.Users);
    const edaRolesRoute = removeNavigationItemById(edaNav, EdaRoute.Roles);
    if (edaRolesRoute && 'children' in edaRolesRoute) {
      const edaRoles = edaRolesRoute.children.find((r) => r.path === '');
      if (edaRoles && 'element' in edaRoles) {
        edaRoles.element = <PlatformEdaRoles />;
      }
      edaRolesRoute.label = undefined;
      edaRolesRoute.path = 'decisions';
    }
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
    const hubRouteRoles = removeNavigationItemById(hubNav, HubRoute.Roles);
    if (hubRouteRoles && 'children' in hubRouteRoles) {
      const hubRoles = hubRouteRoles.children.find((r) => r.path === '');
      if (hubRoles && 'element' in hubRoles) {
        hubRoles.element = <PlatformHubRoles />;
      }
      hubRouteRoles.label = undefined;
      hubRouteRoles.path = 'content';
    }
    // TODO - create token page for all 3 and put in access
    // hubAdministration!.childrenhubNav.push(removeNavigationItemById(hubNav, HubRoute.APIToken)!);
    // const hubApiTokenRoute = removeNavigationItemById(hubNav, HubRoute.APIToken)!;
    // hubApiTokenRoute.label = t('Content API Token');
    removeNavigationItemById(hubNav, HubRoute.Access);

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
      path: 'content',
      children: hubNav,
      hidden: !hubService,
    });

    const analytics = removeNavigationItemById(awxNav, AwxRoute.Analytics);
    if (analytics) {
      analytics.label = t('Automation Analytics');
      analytics.hidden = !awxService;
      navigationItems.push(analytics);
    }
    navigationItems.push({
      id: PlatformRoute.Access,
      label: t('Access Management'),
      path: 'access',
      children: [
        authenticators,
        organizations,
        teams,
        users,
        {
          id: PlatformRoute.Roles,
          label: t('Roles'),
          path: 'roles',
          element: <PlatformRoles />,
          children: [
            awxRolesRoute,
            edaRolesRoute,
            hubRouteRoles,
            {
              path: '',
              element: <Navigate to="execution" />,
            },
          ].filter((r) => r !== undefined) as PageNavigationItem[],
        },
        // awxCredentials,
        // awxCredentialTypes,
        // hubApiTokenRoute,
      ],
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
              element: <SubscriptionWizard onSuccess={() => navigate('/settings/subscription')} />,
            },
            {
              id: PlatformRoute.SubscriptionDetails,
              path: '',
              element: <SubscriptionDetails />,
            },
          ],
        },
        {
          id: AwxRoute.SettingsPreferences,
          label: t('User Preferences'),
          path: 'preferences',
          element: <PageSettings />,
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
    authenticators,
    organizations,
    teams,
    users,
    navigate,
  ]);
  return pageNavigationItems;
}
