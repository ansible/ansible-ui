import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useManageItems } from '../../../../framework/components/useManagedItems';

type Resource = { id: string; name: string; selected: boolean };

export function useManagedAwxDashboard() {
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
      { id: 'recent_job_activity', name: t('Recent job activity'), selected: true },
      { id: 'host', name: t('Hosts'), selected: true },
      { id: 'project', name: t('Projects'), selected: true },
      { id: 'inventory', name: t('Inventories'), selected: true },
      { id: 'recent_jobs', name: t('Recent jobs'), selected: true },
      { id: 'recent_projects', name: t('Recent projects'), selected: true },
      { id: 'recent_inventories', name: t('Recent inventories'), selected: true },
    ],
    [t]
  );
  const { openModal: openManageDashboard, items: managedResources } = useManageItems<Resource>({
    id: 'awx-dashboard',
    title: 'Manage Dashboard',
    description: t(
      'Hide or show the panels you want to see on the overview page by selecting or unselecting, respectively. The panels are ordered from top to bottom on the list. Use the draggable icon :: to re-order your view.'
    ),
    items: resources,
    keyFn: (resources) => resources.id,
    columns,
    hideColumnHeaders: true,
    isSelected: (resource) => resource.selected,
    setSelected: (resource, selected) => {
      resource.selected = selected;
    },
  });

  return {
    openManageDashboard,
    managedResources: managedResources.filter((resource) => resource.selected),
  };
}
