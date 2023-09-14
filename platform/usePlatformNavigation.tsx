import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageNavigationItem } from '../framework';
import { useAwxNavigation } from '../frontend/awx/useAwxNavigation';
import { useEdaNavigation } from '../frontend/eda/useEdaNavigation';
import { useHubNavigation } from '../frontend/hub/useHubNavigation';
import { PlatformDashboard } from './dashboard/PlatformDashboard';

export function usePlatformNavigation() {
  const { t } = useTranslation();
  const awxNavigation = useAwxNavigation();
  const hubNavigation = useHubNavigation();
  const edaNavigation = useEdaNavigation();
  const pageNavigationItems = useMemo<PageNavigationItem[]>(() => {
    const navigationItems: PageNavigationItem[] = [
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
    ];
    return navigationItems;
  }, [awxNavigation, edaNavigation, hubNavigation, t]);
  return pageNavigationItems;
}
