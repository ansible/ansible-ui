import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageHeader, PageLayout, PageTable } from '../../../../framework';
import { useInMemoryView } from '../../../../framework/useInMemoryView';
import { useGet } from '../../../common/useItem';
import { idKeyFn } from '../../../hub/usePulpView';
import { RouteE } from '../../../Routes';
import { EdaInventory } from '../../interfaces/EdaInventory';
import { useInventoriesColumns } from './hooks/useInventoryColumns';
import { useInventoriesFilters } from './hooks/useInventoryFilters';
import { useInventoryRowActions } from './hooks/useInventoryRowActions';
import { useInventoriesToolbarActions } from './hooks/useInventoryToolbarActions';

export function Inventories() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toolbarFilters = useInventoriesFilters();
  const { data: inventories, mutate: refresh } = useGet<EdaInventory[]>('/api/inventories');
  const tableColumns = useInventoriesColumns();
  const view = useInMemoryView<EdaInventory>({
    items: inventories,
    tableColumns,
    toolbarFilters,
    keyFn: idKeyFn,
  });
  const toolbarActions = useInventoriesToolbarActions(refresh);
  const rowActions = useInventoryRowActions(refresh);
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
        emptyStateButtonClick={() => navigate(RouteE.CreateEdaInventory)}
        {...view}
        defaultSubtitle={t('Inventory')}
      />
    </PageLayout>
  );
}
