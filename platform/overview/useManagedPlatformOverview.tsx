import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useManageItems } from '../../framework/components/useManagedItems';

type Resource = { id: string; name: string };

export function useManagedPlatformOverview() {
  // const hasAwx = useHasAwx();
  // const hasEda = useHasEda();

  const { t } = useTranslation();
  const columns = useMemo(
    () => [
      {
        header: t('Dashboard resources'),
        cell: (item: Resource) => item.name,
      },
    ],
    [t]
  );
  const resources: Resource[] = useMemo(
    () => [
      { id: 'quick-starts', name: t('Quick starts') },
      { id: 'counts', name: t('Resource Counts') },
      { id: 'job_activity', name: t('Job activity') },
      { id: 'recent_jobs', name: t('Recent jobs') },
      { id: 'recent_projects', name: t('Recent projects') },
      { id: 'recent_inventories', name: t('Recent inventories') },
      { id: 'recent-rulebook-activations', name: t('Recent rulebook activations') },
      { id: 'recent-rule-audits', name: t('Recent rule audits') },
      { id: 'recent-decision-environments', name: t('Recent decision environments') },
    ],
    [t]
  );
  const { openManageItems: openManageDashboard, managedItems: managedResources } =
    useManageItems<Resource>({
      id: 'platform-dashboard',
      title: 'Manage view',
      description: t(
        'Hide or show the panels you want to see on the overview page by selecting or unselecting, respectively. The panels are ordered from top to bottom on the list. Use the draggable icon :: to re-order your view.'
      ),
      items: resources,
      keyFn: (resources) => resources.id,
      columns,
      hideColumnHeaders: true,
    });

  return {
    openManageDashboard,
    managedResources,
  };
}
