import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { PageNavigationItem, removeNavigationItemById } from '../framework';
import { AwxRoute } from '../frontend/awx/AwxRoutes';
import { useAwxNavigation } from '../frontend/awx/useAwxNavigation';
import { useEdaNavigation } from '../frontend/eda/useEdaNavigation';
import { useHubNavigation } from '../frontend/hub/useHubNavigation';
import { PlatformRoute } from './PlatformRoutes';
import { PlatformDashboard } from './dashboard/PlatformDashboard';

export function usePlatformNavigation() {
  const { t } = useTranslation();
  const awxNavigation = useAwxNavigation();
  const hubNavigation = useHubNavigation();
  const edaNavigation = useEdaNavigation();
  const analyticsNavigation = removeNavigationItemById(awxNavigation, AwxRoute.Reports);
  const pageNavigationItems = useMemo<PageNavigationItem[]>(() => {
    const navigationItems = [
      {
        id: PlatformRoute.Dashboard,
        label: t('Dashboard'),
        path: 'dashboard',
        element: <PlatformDashboard />,
      },
      {
        id: PlatformRoute.AWX,
        label: t('Automation Controller'),
        path: 'awx',
        children: awxNavigation,
      },
      {
        id: PlatformRoute.HUB,
        label: t('Automation Hub'),
        path: 'hub',
        children: hubNavigation,
      },
      {
        id: PlatformRoute.EDA,
        label: t('Event Driven Automation'),
        path: 'eda',
        children: edaNavigation,
      },
      analyticsNavigation,
      {
        id: PlatformRoute.Root,
        path: '',
        element: <Navigate to="dashboard" />,
      },
    ];
    return navigationItems.filter((item) => item !== undefined) as PageNavigationItem[];
  }, [analyticsNavigation, awxNavigation, edaNavigation, hubNavigation, t]);
  return pageNavigationItems;
}
