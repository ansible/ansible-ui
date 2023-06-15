import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable } from '../../../../framework';
import { API_PREFIX } from '../../constants';
import { EdaInventory } from '../../interfaces/EdaInventory';
import { useEdaView } from '../../useEventDrivenView';
import { useInventoriesColumns } from './hooks/useInventoryColumns';
import { useInventoriesFilters } from './hooks/useInventoryFilters';
import { useInventoryRowActions } from './hooks/useInventoryRowActions';
import { useInventoriesToolbarActions } from './hooks/useInventoryToolbarActions';

export function Inventories() {
  const { t } = useTranslation();
  // const navigate = useNavigate();
  const toolbarFilters = useInventoriesFilters();
  const tableColumns = useInventoriesColumns();
  const view = useEdaView<EdaInventory>({
    url: `${API_PREFIX}/inventories/`,
    toolbarFilters,
    tableColumns,
  });
  const toolbarActions = useInventoriesToolbarActions(view);
  const rowActions = useInventoryRowActions(view);
  return (
    <PageLayout>
      <PageHeader title={t('Inventories')} />
      <PageTable
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        toolbarFilters={toolbarFilters}
        rowActions={rowActions}
        errorStateTitle={t('Error loading inventories')}
        emptyStateTitle={t('No inventories yet')}
        emptyStateDescription={t('To get started, create a inventory.')}
        emptyStateButtonText={t('Create inventory')}
        // emptyStateButtonClick={() => navigate(RouteObj.createE)}
        {...view}
        defaultSubtitle={t('Inventory')}
      />
    </PageLayout>
  );
}
