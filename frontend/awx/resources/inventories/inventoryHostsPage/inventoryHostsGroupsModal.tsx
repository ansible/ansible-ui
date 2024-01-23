import { t } from 'i18next';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MultiSelectDialog, usePageDialog } from '../../../../../framework';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxView } from '../../../common/useAwxView';
import { InventoryGroup } from '../../../interfaces/InventoryGroup';
import { useInventoriesGroupsColumns } from './hooks/useInventoriesGroupsColumns';
import { useInventoriesGroupsFilters } from './hooks/useInventoriesGroupsFilters';

export interface InventoryHostGroupsAddModalProps {
  onAdd: (items: InventoryGroup[]) => void;
}

function InventoryHostGroupsAddModal(props: { onAdd: (items: InventoryGroup[]) => void }) {
  const params = useParams<{ id: string; inventory_type: string; host_id: string }>();

  const toolbarFilters = useInventoriesGroupsFilters();
  const tableColumns = useInventoriesGroupsColumns();

  const view = useAwxView<InventoryGroup>({
    url: awxAPI`/inventories/${params.id ?? ''}/groups/`,
    queryParams: { not__hosts: params.host_id ?? '' },
    toolbarFilters,
    tableColumns,
  });

  return (
    <MultiSelectDialog<InventoryGroup>
      title={t('Select groups')}
      toolbarFilters={toolbarFilters}
      tableColumns={tableColumns}
      onSelect={props.onAdd}
      view={view}
    />
  );
}

export function useInventoryHostGroupsAddModal() {
  const [_, setDialog] = usePageDialog();
  const [props, setProps] = useState<InventoryHostGroupsAddModalProps>();
  useEffect(() => {
    if (props) {
      setDialog(<InventoryHostGroupsAddModal {...props} />);
    } else {
      setDialog(undefined);
    }
  }, [props, setDialog]);
  return setProps;
}
