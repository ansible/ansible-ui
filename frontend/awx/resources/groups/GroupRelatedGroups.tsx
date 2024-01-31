import { useTranslation } from 'react-i18next';
import { InventoryGroup } from '../../interfaces/InventoryGroup';
import { PageTable, usePageNavigate } from '../../../../framework';
import { CubeIcon } from '@patternfly/react-icons';
import { AwxRoute } from '../../main/AwxRoutes';
import { useGroupsFilters } from './hooks/useGroupsFilters';
import { useInventoriesGroupsColumns } from '../inventories/hooks/useInventoriesGroupsColumns';
import { useParams } from 'react-router-dom';
import { useInventoriesRelatedGroupsToolbarActions } from '../inventories/hooks/useInventoriesRelatedGroupsToolbarActions';
import { useInventoriesGroupsActions } from '../inventories/hooks/useInventoriesGroupsActions';
import { useOptions } from '../../../common/crud/useOptions';
import { ActionsResponse, OptionsResponse } from '../../interfaces/OptionsResponse';
import { awxAPI } from '../../common/api/awx-utils';
import { useAwxView } from '../../common/useAwxView';

export function GroupRelatedGroups() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const toolbarFilters = useGroupsFilters();
  const tableColumns = useInventoriesGroupsColumns();
  const params = useParams<{ id: string; inventory_type: string; group_id: string }>();
  const view = useAwxView<InventoryGroup>({
    url: awxAPI`/groups/${params.group_id ?? ''}/children`,
    toolbarFilters,
    tableColumns,
  });
  const toolbarActions = useInventoriesRelatedGroupsToolbarActions(view);
  const rowActions = useInventoriesGroupsActions();

  const groupsOptions = useOptions<OptionsResponse<ActionsResponse>>(awxAPI`/groups`).data;
  const canCreateGroup = Boolean(
    groupsOptions && groupsOptions.actions && groupsOptions.actions['POST']
  );

  return (
    <PageTable<InventoryGroup>
      id="awx-inventory-group-related-groups-table"
      toolbarFilters={toolbarFilters}
      toolbarActions={toolbarActions}
      tableColumns={tableColumns}
      rowActions={rowActions}
      errorStateTitle={t('Error loading related groups')}
      emptyStateTitle={
        canCreateGroup
          ? t('There are currently no groups related to this group.')
          : t('You do not have permission to add related groups.')
      }
      emptyStateDescription={
        canCreateGroup
          ? t('Please add related groups by using the button below.')
          : t(
              'Please contact your organization administrator if there is an issue with your access.'
            )
      }
      emptyStateIcon={canCreateGroup ? undefined : CubeIcon}
      emptyStateButtonText={canCreateGroup ? t('Add related groups') : undefined}
      emptyStateButtonClick={
        canCreateGroup
          ? () =>
              pageNavigate(AwxRoute.InventoryGroupRelatedGroupsCreate, {
                params: {
                  id: params.id,
                  inventory_type: params.inventory_type,
                  group_id: params.group_id,
                },
              })
          : undefined
      }
      {...view}
    />
  );
}
