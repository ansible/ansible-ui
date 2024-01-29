import { CubesIcon } from '@patternfly/react-icons';
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
import { useAddInventoryGroups } from './hooks/useAddInventoryGroups';

export function InventoryHostGroups() {
  const { t } = useTranslation();
  const toolbarFilters = useHostsGroupsFilters();
  const tableColumns = useHostsGroupsColumns();
  const params = useParams<{ id: string; inventory_type: string; host_id: string }>();
  const view = useAwxView<InventoryGroup>({
    url: awxAPI`/hosts/${params.host_id ?? ''}/all_groups`,
    toolbarFilters,
    tableColumns,
  });
  const toolbarActions = useHostsGroupsToolbarActions(view);
  const rowActions = useHostsGroupsActions();

  const openInventoryHostsGroupsAddModal = useInventoryHostGroupsAddModal();
  const addGroups = useAddInventoryGroups(view.unselectItemsAndRefresh);

  const groupOptions = useOptions<OptionsResponse<ActionsResponse>>(awxAPI`/groups`).data;
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
        emptyStateButtonText={canCreateGroup ? t('Add group') : undefined}
        emptyStateButtonClick={
          canCreateGroup ? () => openInventoryHostsGroupsAddModal({ onAdd: addGroups }) : undefined
        }
        {...view}
      />
    </PageLayout>
  );
}
