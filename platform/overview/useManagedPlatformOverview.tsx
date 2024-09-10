import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useManageItems } from '../../framework/components/useManagedItems';
import { useHasAwxService, useHasEdaService } from '../main/GatewayServices';
import { useQuickStarts } from './quickstarts/useQuickStarts';

type Resource = { id: string; name: string };

export function useManagedPlatformOverview() {
  const hasAwx = useHasAwxService();
  const hasEda = useHasEdaService();
  const quickStarts = useQuickStarts();

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

  const resources: Resource[] = useMemo(() => {
    const serviceResources: Resource[] = [];

    if (hasAwx) {
      serviceResources.push(
        { id: 'counts', name: t('Resource counts') },
        { id: 'job_activity', name: t('Job activity') },
        { id: 'recent_jobs', name: t('Recent jobs') },
        { id: 'recent_projects', name: t('Recent projects') },
        { id: 'recent_inventories', name: t('Recent inventories') }
      );
    }

    if (hasEda) {
      serviceResources.push(
        { id: 'recent-rulebook-activations', name: t('Recent rulebook activations') },
        { id: 'recent-rule-audits', name: t('Recent rule audits') },
        { id: 'recent-decision-environments', name: t('Recent decision environments') }
      );
    }

    return serviceResources;
  }, [t, hasAwx, hasEda]);

  const quickStartResources: Resource[] = useMemo(() => {
    return quickStarts.length > 0 ? [{ id: 'quick-starts', name: t('Quick starts') }] : [];
  }, [t, quickStarts]);

  const combinedResources = useMemo(() => {
    return [...resources, ...quickStartResources];
  }, [resources, quickStartResources]);

  const sortedForModal = useMemo(() => {
    const serviceResources = combinedResources.filter((item) => item.id !== 'quick-starts');
    const quickStarts = combinedResources.filter((item) => item.id === 'quick-starts');
    return [...serviceResources, ...quickStarts];
  }, [combinedResources]);

  const { openManageItems: openManageDashboard, managedItems: managedResources } =
    useManageItems<Resource>({
      id: 'platform-dashboard',
      title: t('Manage view'),
      description: t(
        'Hide or show the panels you want to see on the overview page by selecting or unselecting, respectively. The panels are ordered from top to bottom on the list. Use the draggable icon :: to re-order your view.'
      ),
      items: sortedForModal,
      keyFn: (resources) => resources.id,
      columns,
      hideColumnHeaders: true,
    });

  const sortedManagedResources = useMemo(() => {
    const serviceResources = managedResources.filter((item) => item.id !== 'quick-starts');
    const quickStarts = managedResources.filter((item) => item.id === 'quick-starts');
    return [...serviceResources, ...quickStarts];
  }, [managedResources]);

  return {
    openManageDashboard,
    managedResources: sortedManagedResources,
  };
}
