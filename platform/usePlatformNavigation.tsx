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
import { PlatformDashboard } from './dashboard/PlatformDashboard';
import { Lightspeed } from './lightspeed/Lightspeed';
import { useGetPlatformOrganizationsRoutes } from './routes/useGetPlatformOrganizationsRoutes';
import { useGetPlatformTeamsRoutes } from './routes/useGetPlatformTeamsRoutes';
import { useGetPlatformUsersRoutes } from './routes/useGetPlatformUsersRoutes';

export function usePlatformNavigation() {
  const { t } = useTranslation();

  const hasAwx = useHasController();
  const hasEda = useHasEda();
  const hasHub = useHasHub();

  const awxNav = useAwxNavigation();
  removeNavigationItemById(awxNav, AwxRoute.Dashboard);
  removeNavigationItemById(awxNav, AwxRoute.Access);

  const edaNav = useEdaNavigation();
  removeNavigationItemById(edaNav, EdaRoute.Dashboard);
  removeNavigationItemById(edaNav, EdaRoute.Users);

  const hubNav = useHubNavigation();
  removeNavigationItemById(hubNav, HubRoute.Dashboard);

  const analytics = removeNavigationItemById(awxNav, AwxRoute.Analytics);
  if (analytics) {
    analytics.label = t('Automation Analytics');
  }

  const organizations = useGetPlatformOrganizationsRoutes();
  const teams = useGetPlatformTeamsRoutes();
  const users = useGetPlatformUsersRoutes();

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
        label: t('Automation Controller'),
        path: 'controller',
        children: awxNav,
      });
    }
    if (hasEda || process.env.NODE_ENV === 'development') {
      navigationItems.push({
        id: PlatformRoute.EDA,
        label: t('Event Driven Automation'),
        path: 'eda',
        children: edaNav,
      });
    }
    if (hasHub || process.env.NODE_ENV === 'development') {
      navigationItems.push({
        id: PlatformRoute.HUB,
        label: t('Automation Hub'),
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
      children: [organizations, teams, users],
    });
    navigationItems.push({
      id: PlatformRoute.Lightspeed,
      label: 'Ansible Lightspeed',
      path: 'lightspeed',
      element: <Lightspeed />,
    });
    navigationItems.push({
      id: PlatformRoute.Root,
      path: '',
      element: <Navigate to="overview" />,
    });

    return navigationItems;
  }, [analytics, awxNav, edaNav, hasAwx, hasEda, hasHub, hubNav, organizations, t, teams, users]);
  return pageNavigationItems;
}
