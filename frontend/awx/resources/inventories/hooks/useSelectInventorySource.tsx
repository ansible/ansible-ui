import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageDialog } from '../../../../../framework';
import { SingleSelectDialog } from '../../../../../framework/PageDialogs/SingleSelectDialog';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxView } from '../../../common/useAwxView';
import { InventorySource } from '../../../interfaces/InventorySource';
import { useInventorySourceColumns } from './useInventorySourceColumns';
import { useInventorySourceFilters } from './useInventorySourceFilters';

function SelectInventorySource(props: {
  title: string;
  onSelect: (inventorySource: InventorySource) => void;
  inventoryId?: number;
}) {
  const { title, inventoryId, onSelect } = props;
  const tableColumns = useInventorySourceColumns({ disableLinks: true });
  const url = inventoryId
    ? awxAPI`/inventories/${inventoryId.toString()}/inventory_sources/`
    : awxAPI`/inventory_sources/`;
  const toolbarFilters = useInventorySourceFilters(url);
  const view = useAwxView<InventorySource>({
    url,
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
  });
  return (
    <SingleSelectDialog<InventorySource>
      title={title}
      onSelect={onSelect}
      toolbarFilters={toolbarFilters}
      tableColumns={tableColumns}
      view={view}
    />
  );
}

export function useSelectInventorySource(inventoryId?: number) {
  const [_, setDialog] = usePageDialog();
  const { t } = useTranslation();
  const openSelectInventory = useCallback(
    (onSelect: (inventory: InventorySource) => void) => {
      setDialog(
        <SelectInventorySource
          title={t('Select inventory source')}
          inventoryId={inventoryId}
          onSelect={onSelect}
        />
      );
    },
    [setDialog, inventoryId, t]
  );
  return openSelectInventory;
}
