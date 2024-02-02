import { useTranslation } from 'react-i18next';
import { PageTable, usePageNavigate } from '../../../../../framework';
import { useGroupsFilters } from '../../groups/hooks/useGroupsFilters';
import { useParams } from 'react-router-dom';
import { useAwxView } from '../../../common/useAwxView';
import { InventoryGroup } from '../../../interfaces/InventoryGroup';
import { awxAPI } from '../../../common/api/awx-utils';
import { useInventoriesGroupsColumns } from '../hooks/useInventoriesGroupsColumns';
import { useInventoriesGroupsToolbarActions } from '../hooks/useInventoriesGroupsToolbarActions';
import { useInventoriesGroupsActions } from '../hooks/useInventoriesGroupsActions';
import { useOptions } from '../../../../common/crud/useOptions';
import { ActionsResponse, OptionsResponse } from '../../../interfaces/OptionsResponse';
import { CubeIcon } from '@patternfly/react-icons';
import { AwxRoute } from '../../../main/AwxRoutes';

export function InventoryGroups() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const toolbarFilters = useGroupsFilters();
  const tableColumns = useInventoriesGroupsColumns();
  const params = useParams<{ id: string; inventory_type: string }>();
  const view = useAwxView<InventoryGroup>({
    url: awxAPI`/inventories/${params.id ?? ''}/groups`,
    toolbarFilters,
    tableColumns,
  });
  const toolbarActions = useInventoriesGroupsToolbarActions(view);
  const rowActions = useInventoriesGroupsActions();

  const groupOptions = useOptions<OptionsResponse<ActionsResponse>>(awxAPI`/groups`).data;
  const canCreateGroup = Boolean(
    groupOptions && groupOptions.actions && groupOptions.actions['POST']
  );

  return (
    <PageTable<InventoryGroup>
      id="awx-inventory-group-table"
      toolbarFilters={toolbarFilters}
      toolbarActions={toolbarActions}
      tableColumns={tableColumns}
      rowActions={rowActions}
      errorStateTitle={t('Error loading inventory groups')}
      emptyStateTitle={
        canCreateGroup
          ? t('There are currently no groups added to this inventory.')
          : t('You do not have permission to create a group')
      }
      emptyStateDescription={
        canCreateGroup
          ? t('Please create a group by using the button below.')
          : t(
              'Please contact your organization administrator if there is an issue with your access.'
            )
      }
      emptyStateIcon={canCreateGroup ? undefined : CubeIcon}
      emptyStateButtonText={canCreateGroup ? t('Create group') : undefined}
      emptyStateButtonClick={
        canCreateGroup
          ? () =>
              pageNavigate(AwxRoute.InventoryGroupCreate, {
                params: { id: params.id, inventory_type: params.inventory_type },
              })
          : undefined
      }
      {...view}
    />
  );
}
