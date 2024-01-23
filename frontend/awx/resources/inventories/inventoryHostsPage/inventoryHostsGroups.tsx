import { CubesIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageLayout, PageTable } from '../../../../../framework';
import { useOptions } from '../../../../common/crud/useOptions';
import { usePersistentFilters } from '../../../../common/PersistentFilters';
import { awxAPI } from '../../../common/api/awx-utils';
import { OptionsResponse, ActionsResponse } from '../../../interfaces/OptionsResponse';
import { useAwxView } from '../../../common/useAwxView';
import { useInventoriesGroupsFilters } from './hooks/useInventoriesGroupsFilters';
import { useInventoriesGroupsToolbarActions } from './hooks/useInventoriesGroupsToolbarActions';
import { useInventoriesGroupsActions } from './hooks/useInventoriesGroupsActions';
import { useInventoriesGroupsColumns } from './hooks/useInventoriesGroupsColumns';
import { InventoryGroup } from '../../../interfaces/InventoryGroup';

export function InventoryHostsGroups() {
  const { t } = useTranslation();
  const toolbarFilters = useInventoriesGroupsFilters();
  const tableColumns = useInventoriesGroupsColumns();
  const params = useParams<{ id: string; inventory_type: string; host_id: string }>();
  const view = useAwxView<InventoryGroup>({
    url: awxAPI`/hosts/${params.host_id ?? ''}/all_groups`,
    toolbarFilters,
    tableColumns,
  });
  const toolbarActions = useInventoriesGroupsToolbarActions(view);
  const rowActions = useInventoriesGroupsActions();


  const groupOptions = useOptions<OptionsResponse<ActionsResponse>>(awxAPI`/hosts`).data;
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
        errorStateTitle={t('Error loading inventory hosts')}
        emptyStateTitle={
          canCreateGroup
            ? t('There are currently no groups associated with this inventory.')
            : t('You do not have permission to create a group')
        }
        emptyStateDescription={
          canCreateGroup
            ? t('Please create a group by using the button below.')
            : t(
                'Please contact your organization administrator if there is an issue with your access.'
              )
        }
        emptyStateIcon={canCreateGroup ? undefined : CubesIcon}
        emptyStateButtonText={canCreateGroup ? t('Create group') : undefined}
        emptyStateButtonClick={canCreateGroup ? () => undefined : undefined}
        {...view}
      />
    </PageLayout>
  );
}
