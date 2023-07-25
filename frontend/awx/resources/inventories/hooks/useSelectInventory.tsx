import { useTranslation } from 'react-i18next';
import { SelectSingleDialog } from '../../../../../framework/PageDialogs/SelectSingleDialog';
import { useAwxView } from '../../../useAwxView';
import { useInventoriesColumns } from './useInventoriesColumns';
import { useInventoriesFilters } from './useInventoriesFilters';
import { Inventory } from '../../../interfaces/Inventory';
import { usePageDialog } from '../../../../../framework';
import { useCallback } from 'react';

function SelectInventory(props: { title: string; onSelect: (inventory: Inventory) => void }) {
  const toolbarFilters = useInventoriesFilters();
  const tableColumns = useInventoriesColumns({ disableLinks: true });
  const view = useAwxView<Inventory>({
    url: '/api/v2/inventories/',
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
  });
  return (
    <SelectSingleDialog<Inventory>
      {...props}
      toolbarFilters={toolbarFilters}
      tableColumns={tableColumns}
      view={view}
    />
  );
}

export function useSelectInventory() {
  const [_, setDialog] = usePageDialog();
  const { t } = useTranslation();
  const openSelectInventory = useCallback(
    (onSelect: (inventory: Inventory) => void) => {
      setDialog(<SelectInventory title={t('Select inventory')} onSelect={onSelect} />);
    },
    [setDialog, t]
  );
  return openSelectInventory;
}
