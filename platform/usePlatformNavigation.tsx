import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { PageNavigationItem, removeNavigationItemById } from '../framework';
import { AwxRoute } from '../frontend/awx/AwxRoutes';
import { useAwxNavigation } from '../frontend/awx/useAwxNavigation';
import { EdaRoute } from '../frontend/eda/EdaRoutes';
import { useEdaNavigation } from '../frontend/eda/useEdaNavigation';
import { HubRoute } from '../frontend/hub/HubRoutes';
import { useHubNavigation } from '../frontend/hub/useHubNavigation';
import { useHasController, useHasEda, useHasHub } from './PlatformProvider';
import { PlatformRoute } from './PlatformRoutes';
import { PlatformAwxRoles } from './access/roles/PlatformAwxRoles';
import { PlatformEdaRoles } from './access/roles/PlatformEdaRoles';
import { PlatformHubRoles } from './access/roles/PlatformHubRoles';
import { PlatformRoles } from './access/roles/PlatformRoles';
import { PlatformDashboard } from './dashboard/PlatformDashboard';
import { QuickStartsPage } from './dashboard/quickstarts/Quickstarts';
import { Lightspeed } from './lightspeed/Lightspeed';
import { useGetPlatformAuthenticatorsRoutes } from './routes/useGetPlatformAuthenticatorsRoutes';
import { useGetPlatformOrganizationsRoutes } from './routes/useGetPlatformOrganizationsRoutes';
import { useGetPlatformTeamsRoutes } from './routes/useGetPlatformTeamsRoutes';
import { useGetPlatformUsersRoutes } from './routes/useGetPlatformUsersRoutes';

export function usePlatformNavigation() {
  const { t } = useTranslation();

  const hasAwx = useHasController();
  const hasEda = useHasEda();
  const hasHub = useHasHub();

  const awxNav = useAwxNavigation();
  removeNavigationItemById(awxNav, AwxRoute.Overview);
  const credentials = removeNavigationItemById(awxNav, AwxRoute.Credentials)!;
  const credentialTypes = removeNavigationItemById(awxNav, AwxRoute.CredentialTypes)!;
  removeNavigationItemById(awxNav, AwxRoute.Access);

  const edaNav = useEdaNavigation();
  removeNavigationItemById(edaNav, EdaRoute.Overview);
  removeNavigationItemById(edaNav, EdaRoute.Users);
  const edaRolesRoute = removeNavigationItemById(edaNav, EdaRoute.Roles)!;
  if ('children' in edaRolesRoute) {
    const edaRoles = edaRolesRoute.children.find((r) => r.path === '')!;
    if ('element' in edaRoles) {
      edaRoles.element = <PlatformEdaRoles />;
    }
    edaRolesRoute.label = undefined;
    edaRolesRoute.path = 'decisions';
  }
  // removeNavigationItemById(edaNav, EdaRoute.Credentials)
  removeNavigationItemById(edaNav, EdaRoute.Access);

  const hubNav = useHubNavigation();
  removeNavigationItemById(hubNav, HubRoute.Overview);
  removeNavigationItemById(hubNav, HubRoute.Organizations);
  removeNavigationItemById(hubNav, HubRoute.Teams);
  removeNavigationItemById(hubNav, HubRoute.Users);
  const hubRouteRoles = removeNavigationItemById(hubNav, HubRoute.Roles)!;
  if ('children' in hubRouteRoles) {
    const hubRoles = hubRouteRoles.children.find((r) => r.path === '')!;
    if ('element' in hubRoles) {
      hubRoles.element = <PlatformHubRoles />;
    }
    hubRouteRoles.label = undefined;
    hubRouteRoles.path = 'content';
  }
  // TODO - create token page for all 3 and put in access
  // hubAdministration!.childrenhubNav.push(removeNavigationItemById(hubNav, HubRoute.APIToken)!);
  removeNavigationItemById(hubNav, HubRoute.Access);

  const analytics = removeNavigationItemById(awxNav, AwxRoute.Analytics);
  if (analytics) {
    analytics.label = t('Automation Analytics');
  }

  const organizations = useGetPlatformOrganizationsRoutes();
  const teams = useGetPlatformTeamsRoutes();
  const users = useGetPlatformUsersRoutes();
  const authenticators = useGetPlatformAuthenticatorsRoutes();

  const pageNavigationItems = useMemo<PageNavigationItem[]>(() => {
    const navigationItems: PageNavigationItem[] = [];
    navigationItems.push({
      id: PlatformRoute.Dashboard,
      label: t('Overview'),
      path: 'overview',
      element: <PlatformDashboard />,
    });
    if (hasAwx || process.env.NODE_ENV === 'development') {
      navigationItems.push({
        id: PlatformRoute.AWX,
        label: t('Automation Execution'),
        path: 'execution',
        children: awxNav,
      });
    }
    if (hasEda || process.env.NODE_ENV === 'development') {
      navigationItems.push({
        id: PlatformRoute.EDA,
        label: t('Automation Decisions'),
        path: 'descicions',
        children: edaNav,
      });
    }
    if (hasHub || process.env.NODE_ENV === 'development') {
      navigationItems.push({
        id: PlatformRoute.HUB,
        label: t('Automation Content'),
        path: 'content',
        children: hubNav,
      });
    }
    if ((hasAwx || process.env.NODE_ENV === 'development') && analytics) {
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
            {
              id: PlatformRoute.ExecutionRoles,
              path: 'execution',
              element: <PlatformAwxRoles />,
            },
            edaRolesRoute,
            hubRouteRoles,
            {
              path: '',
              element: <Navigate to="execution" />,
            },
          ],
        },
        credentials,
        credentialTypes,
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
      id: PlatformRoute.Root,
      path: '',
      element: <Navigate to="overview" />,
    });

    return navigationItems;
  }, [
    t,
    hasAwx,
    hasEda,
    hasHub,
    analytics,
    authenticators,
    organizations,
    teams,
    users,
    edaRolesRoute,
    hubRouteRoles,
    credentials,
    credentialTypes,
    awxNav,
    edaNav,
    hubNav,
  ]);
  return pageNavigationItems;
}
