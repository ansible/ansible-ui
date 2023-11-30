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
import { PlatformRoles } from './access/roles/Roles';
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
  // removeNavigationItemById(edaNav, EdaRoute.Roles);
  // removeNavigationItemById(edaNav, EdaRoute.Credentials)
  removeNavigationItemById(edaNav, EdaRoute.Access);

  const hubNav = useHubNavigation();
  removeNavigationItemById(hubNav, HubRoute.Overview);
  removeNavigationItemById(hubNav, HubRoute.Organizations);
  removeNavigationItemById(hubNav, HubRoute.Teams);
  removeNavigationItemById(hubNav, HubRoute.Users);
  // const hubAdministration = findNavigationItemById(hubNav, HubRoute.Administration);
  // hubAdministration!.children.push(removeNavigationItemById(hubNav, HubRoute.Roles)!);
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
        path: 'controller',
        children: awxNav,
      });
    }
    if (hasEda || process.env.NODE_ENV === 'development') {
      navigationItems.push({
        id: PlatformRoute.EDA,
        label: t('Automation Decisions'),
        path: 'eda',
        children: edaNav,
      });
    }
    if (hasHub || process.env.NODE_ENV === 'development') {
      navigationItems.push({
        id: PlatformRoute.HUB,
        label: t('Automation Content'),
        path: 'hub',
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
    credentials,
    credentialTypes,
    awxNav,
    edaNav,
    hubNav,
  ]);
  return pageNavigationItems;
}
