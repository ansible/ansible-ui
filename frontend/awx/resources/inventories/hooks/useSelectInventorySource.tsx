import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageDialog } from '../../../../../framework';
import { SelectSingleDialog } from '../../../../../framework/PageDialogs/SelectSingleDialog';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxView } from '../../../common/useAwxView';
import { InventorySource } from '../../../interfaces/InventorySource';
import { useInventorySourceColumns } from './useInventorySourceColumns';
import { useInventorySourceFilters } from './useInventorySourceFilters';

function SelectInventorySource(props: {
  title: string;
  onSelect: (inventorySource: InventorySource) => void;
}) {
  const toolbarFilters = useInventorySourceFilters();
  const tableColumns = useInventorySourceColumns({ disableLinks: true });
  const view = useAwxView<InventorySource>({
    url: awxAPI`/inventories/`,
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
  });
  return (
    <SelectSingleDialog<InventorySource>
      {...props}
      toolbarFilters={toolbarFilters}
      tableColumns={tableColumns}
      view={view}
    />
  );
}

export function useSelectInventorySource() {
  const [_, setDialog] = usePageDialog();
  const { t } = useTranslation();
  const openSelectInventory = useCallback(
    (onSelect: (inventory: InventorySource) => void) => {
      setDialog(<SelectInventorySource title={t('Select inventory source')} onSelect={onSelect} />);
    },
    [setDialog, t]
  );
  return openSelectInventory;
}
