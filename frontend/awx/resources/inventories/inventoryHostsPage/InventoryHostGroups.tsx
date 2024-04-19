import { CubesIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageLayout, PageTable } from '../../../../../framework';
import { useOptions } from '../../../../common/crud/useOptions';
import { usePersistentFilters } from '../../../../common/PersistentFilters';
import { awxAPI } from '../../../common/api/awx-utils';
import { OptionsResponse, ActionsResponse } from '../../../interfaces/OptionsResponse';
import { useAwxView } from '../../../common/useAwxView';
import { useHostsGroupsFilters } from './hooks/useHostsGroupsFilters';
import { useHostsGroupsToolbarActions } from './hooks/useHostsGroupsToolbarActions';
import { useHostsGroupsActions } from './hooks/useHostsGroupsActions';
import { useHostsGroupsColumns } from './hooks/useHostsGroupsColumns';
import { InventoryGroup } from '../../../interfaces/InventoryGroup';
import { useInventoryHostGroupsAddModal } from './InventoryHostGroupsModal';
import { useAssociateGroupsToHost } from './hooks/useAssociateGroupsToHost';
import { useGetHost } from '../../hosts/hooks/useGetHost';

export function InventoryHostGroups(props: { page: string }) {
  const { t } = useTranslation();
  const tableColumns = useHostsGroupsColumns();
  const isHostPage: boolean = props.page === 'host';
  const params = useParams<{ id: string; inventory_type: string; host_id: string }>();
  const { host } = useGetHost(isHostPage ? params.id ?? '' : params.host_id ?? '');

  const inventoryId = String(host?.inventory) ?? '';
  const hostId = isHostPage ? params.id ?? '' : params.host_id ?? '';

  const toolbarFilters = useHostsGroupsFilters(`hosts/${hostId ?? ''}/all_groups`);
  const view = useAwxView<InventoryGroup>({
    url: awxAPI`/hosts/${hostId ?? ''}/all_groups/`,
    toolbarFilters,
    tableColumns,
  });

  const toolbarActions = useHostsGroupsToolbarActions(view, inventoryId, hostId, isHostPage);
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
        emptyStateTitle={
          canCreateGroup
            ? t('There are currently no groups associated with this host')
            : t('You do not have permission to add a group')
        }
        emptyStateDescription={
          canCreateGroup
            ? t('Please add a group by using the button below.')
            : t(
                'Please contact your organization administrator if there is an issue with your access.'
              )
        }
        emptyStateIcon={canCreateGroup ? undefined : CubesIcon}
        emptyStateButtonIcon={<PlusCircleIcon />}
        emptyStateButtonText={canCreateGroup ? t('Associate groups') : undefined}
        emptyStateButtonClick={
          canCreateGroup
            ? () =>
                openInventoryHostsGroupsAddModal({
                  onAdd: associateGroups,
                  inventoryId: inventoryId,
                  hostId: hostId,
                })
            : undefined
        }
        {...view}
      />
    </PageLayout>
  );
}
