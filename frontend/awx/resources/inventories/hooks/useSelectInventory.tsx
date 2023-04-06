import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelectDialog } from '../../../../../framework';
import { Inventory } from '../../../interfaces/Inventory';
import { useAwxView } from '../../../useAwxView';
import { useInventoriesColumns } from './useInventoriesColumns';
import { useInventoriesFilters } from './useInventoriesFilters';

export function useSelectInventory(isLookup: boolean) {
  const { t } = useTranslation();
  const toolbarFilters = useInventoriesFilters();
  const tableColumns = useInventoriesColumns({ disableLinks: true });

  const columns = useMemo(
    () => (isLookup ? tableColumns.filter((item) => ['Name'].includes(item.header)) : tableColumns),
    [isLookup, tableColumns]
  );
  const view = useAwxView<Inventory>({
    url: '/api/v2/inventories/',
    toolbarFilters,
    tableColumns: columns,
    disableQueryString: true,
  });

  return {
    useSelectDialog: useSelectDialog<Inventory>({
      toolbarFilters,
      tableColumns: columns,
      view,
      confirm: t('Confirm'),
      cancel: t('Cancel'),
      selected: t('Selected'),
    }),
    view,
  };
}
