import { CubeIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageTable } from '../../../../../framework';
import { useOptions } from '../../../../common/crud/useOptions';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxView } from '../../../common/useAwxView';
import { InventoryGroup } from '../../../interfaces/InventoryGroup';
import { ActionsResponse, OptionsResponse } from '../../../interfaces/OptionsResponse';
import { useInventoriesGroupsActions } from '../hooks/useInventoriesGroupsActions';
import { useGroupsFilters } from './hooks/useGroupsFilters';
import { useRelatedGroupsColumns } from './hooks/useRelatedGroupsColumns';
import { useRelatedGroupsEmptyStateActions } from './hooks/useRelatedGroupsEmptyStateActions';
import { useRelatedGroupsToolbarActions } from './hooks/useRelatedGroupsToolbarActions';

export function GroupRelatedGroups() {
  const { t } = useTranslation();
  const toolbarFilters = useGroupsFilters();
  const tableColumns = useRelatedGroupsColumns();
  const params = useParams<{ id: string; inventory_type: string; group_id: string }>();
  const view = useAwxView<InventoryGroup>({
    url: awxAPI`/groups/${params.group_id ?? ''}/children/`,
    toolbarFilters,
    tableColumns,
  });
  const toolbarActions = useRelatedGroupsToolbarActions(view);
  const rowActions = useInventoriesGroupsActions();
  const emptyStateActions = useRelatedGroupsEmptyStateActions(view);

  const groupsOptions = useOptions<OptionsResponse<ActionsResponse>>(awxAPI`/groups/`).data;
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
          ? t('Please add related groups by using the buttons below.')
          : t(
              'Please contact your organization administrator if there is an issue with your access.'
            )
      }
      emptyStateIcon={canCreateGroup ? undefined : CubeIcon}
      emptyStateButtonText={canCreateGroup ? t('Add related groups') : undefined}
      emptyStateActions={emptyStateActions}
      {...view}
    />
  );
}
