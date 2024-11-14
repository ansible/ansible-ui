import { PageLayout, PageTable } from '@ansible/ansible-ui-framework';
import { PageTableEmptyState } from '@ansible/ansible-ui-framework/PageTable/PageTableEmptyState';
import { useOptions } from '@ansible/common-ui/crud/useOptions';
import { usePersistentFilters } from '@ansible/common-ui/PersistentFilters';
import { Button } from '@patternfly/react-core';
import { CubesIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxView } from '../../../common/useAwxView';
import { InventoryGroup } from '../../../interfaces/InventoryGroup';
import { ActionsResponse, OptionsResponse } from '../../../interfaces/OptionsResponse';
import { useGetHost } from '../../hosts/hooks/useGetHost';
import { useAssociateGroupsToHost } from './hooks/useAssociateGroupsToHost';
import { useHostsGroupsActions } from './hooks/useHostsGroupsActions';
import { useHostsGroupsColumns } from './hooks/useHostsGroupsColumns';
import { useHostsGroupsFilters } from './hooks/useHostsGroupsFilters';
import { useHostsGroupsToolbarActions } from './hooks/useHostsGroupsToolbarActions';
import { useInventoryHostGroupsAddModal } from './InventoryHostGroupsModal';

export function InventoryHostGroups(props: { page: string }) {
  const { t } = useTranslation();
  const tableColumns = useHostsGroupsColumns({ useGroupInventory: true });
  const isHostPage: boolean = props.page === 'host';
  const params = useParams<{ id: string; inventory_type: string; host_id: string }>();
  const { host } = useGetHost(isHostPage ? (params.id ?? '') : (params.host_id ?? ''));
  const inventoryId = String(host?.inventory) ?? '';
  const hostId = isHostPage ? (params.id ?? '') : (params.host_id ?? '');

  const toolbarFilters = useHostsGroupsFilters(`hosts/${hostId ?? ''}/all_groups`);
  const view = useAwxView<InventoryGroup>({
    url: awxAPI`/hosts/${hostId ?? ''}/all_groups/`,
    toolbarFilters,
    tableColumns,
  });

  const toolbarActions = useHostsGroupsToolbarActions(
    view,
    inventoryId,
    hostId,
    isHostPage ? 'standaloneHost' : 'inventoryHost'
  );
  const rowActions = useHostsGroupsActions(inventoryId);

  const openInventoryHostsGroupsAddModal = useInventoryHostGroupsAddModal();
  const associateGroups = useAssociateGroupsToHost(view.unselectItemsAndRefresh, hostId);

  const groupOptions = useOptions<OptionsResponse<ActionsResponse>>(awxAPI`/groups/`).data;
  const canCreateGroup = Boolean(
    groupOptions && groupOptions.actions && groupOptions.actions['POST']
  );

  usePersistentFilters('inventories');

  return (
    <PageLayout>
      <PageTable<InventoryGroup>
        id="awx-inventory-groups-table"
        toolbarFilters={toolbarFilters}
        toolbarActions={toolbarActions}
        tableColumns={tableColumns}
        rowActions={rowActions}
        errorStateTitle={t('Error loading associated groups')}
        emptyState={
          canCreateGroup ? (
            <PageTableEmptyState
              title={t('There are currently no groups associated with this host')}
              description={t('Please add a group by using the button below.')}
            >
              <Button
                icon={<PlusCircleIcon />}
                variant="primary"
                onClick={() =>
                  openInventoryHostsGroupsAddModal({
                    onAdd: associateGroups,
                    inventoryId: inventoryId,
                    hostId: hostId,
                  })
                }
              >
                {t('Associate groups')}
              </Button>
            </PageTableEmptyState>
          ) : (
            <PageTableEmptyState
              icon={CubesIcon}
              title={t('You do not have permission to add a group')}
              description={t(
                'Please contact your organization administrator if there is an issue with your access.'
              )}
            />
          )
        }
        {...view}
      />
    </PageLayout>
  );
}
