import { t } from 'i18next';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MultiSelectDialog, usePageDialog } from '../../../../../framework';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxView } from '../../../common/useAwxView';
import { InventoryGroup } from '../../../interfaces/InventoryGroup';
import { useHostsGroupsColumns } from './hooks/useHostsGroupsColumns';
import { useHostsGroupsFilters } from './hooks/useHostsGroupsFilters';

export interface InventoryHostGroupsAddModalProps {
  onAdd: (items: InventoryGroup[]) => void;
}

export function InventoryHostGroupsAddModal(props: { onAdd: (items: InventoryGroup[]) => void }) {
  const params = useParams<{ id: string; inventory_type: string; host_id: string }>();

  const toolbarFilters = useHostsGroupsFilters();
  const tableColumns = useHostsGroupsColumns();

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
      errorStateTitle={t('Error loading groups to associate')}
      emptyStateTitle={t('No groups available to add to host')}
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
