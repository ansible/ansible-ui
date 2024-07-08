import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageDialogs } from '../../../../../framework';
import { SingleSelectDialog } from '../../../../../framework/PageDialogs/SingleSelectDialog';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxView } from '../../../common/useAwxView';
import { Inventory } from '../../../interfaces/Inventory';
import { useInventoriesColumns } from './useInventoriesColumns';
import { useInventoriesFilters } from './useInventoriesFilters';

function SelectInventory(props: { title: string; onSelect: (inventory: Inventory) => void }) {
  const toolbarFilters = useInventoriesFilters();
  const tableColumns = useInventoriesColumns({ disableLinks: true });
  const view = useAwxView<Inventory>({
    url: awxAPI`/inventories/`,
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
  });
  return (
    <SingleSelectDialog<Inventory>
      {...props}
      toolbarFilters={toolbarFilters}
      tableColumns={tableColumns}
      view={view}
    />
  );
}

export function useSelectInventory() {
  const { pushDialog } = usePageDialogs();
  const { t } = useTranslation();
  const openSelectInventory = useCallback(
    (onSelect: (inventory: Inventory) => void) => {
      pushDialog(<SelectInventory title={t('Select inventory')} onSelect={onSelect} />);
    },
    [pushDialog, t]
  );
  return openSelectInventory;
}
