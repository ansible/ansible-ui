import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageNavigationItem, removeNavigationItemById } from '../framework';
import { AwxRoute } from '../frontend/awx/AwxRoutes';
import { useAwxNavigation } from '../frontend/awx/useAwxNavigation';
import { useEdaNavigation } from '../frontend/eda/useEdaNavigation';
import { useHubNavigation } from '../frontend/hub/useHubNavigation';
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
        id: 'platform-dashboard',
        label: t('Dashboard'),
        path: 'dashboard',
        element: <PlatformDashboard />,
      },
      {
        id: 'platform-awx',
        label: t('Automation Controller'),
        path: 'awx',
        children: awxNavigation,
      },
      {
        id: 'platform-hub',
        label: t('Automation Hub'),
        path: 'hub',
        children: hubNavigation,
      },
      {
        id: 'platform-eda',
        label: t('Event Driven Automation'),
        path: 'eda',
        children: edaNavigation,
      },
      analyticsNavigation,
    ];
    return navigationItems.filter((item) => item !== undefined) as PageNavigationItem[];
  }, [analyticsNavigation, awxNavigation, edaNavigation, hubNavigation, t]);
  return pageNavigationItems;
}
