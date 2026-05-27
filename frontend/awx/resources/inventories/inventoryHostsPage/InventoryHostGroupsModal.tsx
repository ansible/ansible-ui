import { MultiSelectDialog, usePageDialog } from '@ansible/ansible-ui-framework';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxView } from '../../../common/useAwxView';
import { InventoryGroup } from '../../../interfaces/InventoryGroup';
import { useHostsGroupsColumns } from './hooks/useHostsGroupsColumns';
import { useHostsGroupsFilters } from './hooks/useHostsGroupsFilters';

export interface InventoryHostGroupsAddModalProps {
  onAdd: (items: InventoryGroup[]) => void;
  inventoryId: string;
  hostId: string;
}

export function InventoryHostGroupsAddModal(props: {
  onAdd: (items: InventoryGroup[]) => void;
  inventoryId: string;
  hostId: string;
}) {
  const { t } = useTranslation();
  const toolbarFilters = useHostsGroupsFilters(`inventories/${props.inventoryId ?? ''}/groups`);
  const tableColumns = useHostsGroupsColumns({ disableLinks: true });

  const view = useAwxView<InventoryGroup>({
    url: awxAPI`/inventories/${props.inventoryId ?? ''}/groups/`,
    queryParams: { not__hosts: props.hostId ?? '' },
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
