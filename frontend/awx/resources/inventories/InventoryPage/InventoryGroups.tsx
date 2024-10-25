import { ButtonVariant } from '@patternfly/react-core';
import { CubeIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageTable, useGetPageUrl } from '../../../../../framework';
import { ButtonLink } from '../../../../../framework/components/ButtonLink';
import { PageTableEmptyState } from '../../../../../framework/PageTable/PageTableEmptyState';
import { useOptions } from '../../../../common/crud/useOptions';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxView } from '../../../common/useAwxView';
import { InventoryGroup } from '../../../interfaces/InventoryGroup';
import { ActionsResponse, OptionsResponse } from '../../../interfaces/OptionsResponse';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useGroupsFilters } from '../../groups/hooks/useGroupsFilters';
import { useInventoriesGroupsActions } from '../hooks/useInventoriesGroupsActions';
import { useInventoriesGroupsColumns } from '../hooks/useInventoriesGroupsColumns';
import { useInventoriesGroupsToolbarActions } from '../hooks/useInventoriesGroupsToolbarActions';

export function InventoryGroups() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const tableColumns = useInventoriesGroupsColumns();
  const params = useParams<{ id: string; inventory_type: string }>();
  const toolbarFilters = useGroupsFilters({ url: `inventories/${params.id ?? ''}/groups` });
  const view = useAwxView<InventoryGroup>({
    url: awxAPI`/inventories/${params.id ?? ''}/groups/`,
    toolbarFilters,
    tableColumns,
  });
  const toolbarActions = useInventoriesGroupsToolbarActions(view);
  const rowActions = useInventoriesGroupsActions();

  const constructed_inventory = params.inventory_type === 'constructed_inventory' ? true : false;
  const groupOptions = useOptions<OptionsResponse<ActionsResponse>>(awxAPI`/groups/`).data;
  const canCreateGroup = Boolean(
    groupOptions && groupOptions.actions && groupOptions.actions['POST'] && !constructed_inventory
  );

  let emptyStateTitle = '';
  let emptyStateDescription = '';

  if (constructed_inventory) {
    emptyStateTitle = t('No Items Found');
    emptyStateDescription = t('Please add Items to populate this list');
  } else {
    emptyStateTitle = canCreateGroup
      ? t('There are currently no groups added to this inventory.')
      : t('You do not have permission to create a group');

    emptyStateDescription = canCreateGroup
      ? t('Please create a group by using the button below.')
      : t('Please contact your organization administrator if there is an issue with your access.');
  }

  return (
    <PageTable<InventoryGroup>
      id="awx-inventory-group-table"
      toolbarFilters={toolbarFilters}
      toolbarActions={toolbarActions}
      tableColumns={tableColumns}
      rowActions={rowActions}
      errorStateTitle={t('Error loading inventory groups')}
      emptyState={
        canCreateGroup ? (
          <PageTableEmptyState title={emptyStateTitle} description={emptyStateDescription}>
            <ButtonLink
              variant={ButtonVariant.primary}
              icon={<PlusCircleIcon />}
              href={getPageUrl(AwxRoute.InventoryGroupCreate, {
                params: { id: params.id, inventory_type: params.inventory_type },
              })}
            >
              {t('Create group')}
            </ButtonLink>
          </PageTableEmptyState>
        ) : (
          <PageTableEmptyState
            icon={CubeIcon}
            title={emptyStateTitle}
            description={emptyStateDescription}
          />
        )
      }
      {...view}
    />
  );
}
