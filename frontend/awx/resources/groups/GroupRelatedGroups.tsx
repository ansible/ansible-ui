import { PageTable } from '@ansible/ansible-ui-framework';
import { useOptions } from '@ansible/common-ui/crud/useOptions';
import { CubeIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { awxAPI } from '../../common/api/awx-utils';
import { useAwxView } from '../../common/useAwxView';
import { InventoryGroup } from '../../interfaces/InventoryGroup';
import { ActionsResponse, OptionsResponse } from '../../interfaces/OptionsResponse';
import { useInventoriesGroupsActions } from '../inventories/hooks/useInventoriesGroupsActions';
import { useGroupsFilters } from './hooks/useGroupsFilters';
import { useRelatedGroupsColumns } from './hooks/useRelatedGroupsColumns';
import { useRelatedGroupsEmptyStateActions } from './hooks/useRelatedGroupsEmptyStateActions';
import { useRelatedGroupsToolbarActions } from './hooks/useRelatedGroupsToolbarActions';

export function GroupRelatedGroups() {
  const { t } = useTranslation();
  const tableColumns = useRelatedGroupsColumns();
  const params = useParams<{ id: string; inventory_type: string; group_id: string }>();
  const toolbarFilters = useGroupsFilters({ url: `groups/${params.group_id ?? ''}/children` });
  const view = useAwxView<InventoryGroup>({
    url: awxAPI`/groups/${params.group_id ?? ''}/children/`,
    toolbarFilters,
    tableColumns,
    // allow run command limit to persist
    ignoreQueryStringKeys: ['limit'],
  });
  const toolbarActions = useRelatedGroupsToolbarActions(view);
  const rowActions = useInventoriesGroupsActions();
  const emptyStateActions = useRelatedGroupsEmptyStateActions(view);

  const groupsOptions = useOptions<OptionsResponse<ActionsResponse>>(awxAPI`/groups/`).data;
  const canCreateGroup = Boolean(
    groupsOptions && groupsOptions.actions && groupsOptions.actions['POST']
  );

  const isConstructed = params.inventory_type === 'constructed_inventory';

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
          ? isConstructed
            ? t('No Related Groups Found')
            : t('There are currently no groups related to this group.')
          : t('You do not have permission to add related groups.')
      }
      emptyStateDescription={
        canCreateGroup
          ? isConstructed
            ? t('Please add Related Groups to populate this list')
            : t('Please add related groups by using the buttons below.')
          : t(
              'Please contact your organization administrator if there is an issue with your access.'
            )
      }
      emptyStateIcon={canCreateGroup ? undefined : CubeIcon}
      emptyStateButtonIcon={<PlusCircleIcon />}
      emptyStateButtonText={canCreateGroup && !isConstructed ? t('Add related groups') : undefined}
      emptyStateActions={emptyStateActions}
      {...view}
    />
  );
}
