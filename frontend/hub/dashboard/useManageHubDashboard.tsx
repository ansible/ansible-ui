import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useManageItems } from '../../../framework/components/useManagedItems';

type Category = { id: string; name: string; selected: boolean };

export function useManageHubDashboard() {
  const { t } = useTranslation();
  const columns = useMemo(
    () => [
      {
        header: t('Categories of collections'),
        cell: (item: Category) => item.name,
      },
    ],
    [t]
  );
  const categories: Category[] = useMemo(
    () => [
      { id: 'owner', name: t('My collections'), selected: true },
      { id: 'featured', name: t('Featured collections'), selected: true },
      { id: 'eda', name: t('Event-Driven Ansible content'), selected: true },
      { id: 'storage', name: t('Storage collections'), selected: true },
      { id: 'system', name: t('System collections'), selected: true },
    ],
    [t]
  );

  const { openModal: openManageDashboard, items: managedCategories } = useManageItems<Category>({
    id: 'hub-dashboard',
    title: 'Manage Dashboard',
    description: t(
      'Hide or show the panels you want to see on the overview page by selecting or unselecting, respectively. The panels are ordered from top to bottom on the list. Use the draggable icon :: to re-order your view.'
    ),
    items: categories,
    keyFn: (categories) => categories.id,
    columns,
    hideColumnHeaders: true,
    isSelected: (category) => category.selected,
    setSelected: (category, selected) => {
      category.selected = selected;
    },
  });

  return {
    openManageDashboard,
    managedCategories: managedCategories.filter((category) => category.selected),
  };
}
