import { PageLayout, PageTable, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { ButtonLink } from '@ansible/ansible-ui-framework/components/ButtonLink';
import { PageTableEmptyState } from '@ansible/ansible-ui-framework/PageTable/PageTableEmptyState';
import { useOptions } from '@ansible/common-ui/crud/useOptions';
import { usePersistentFilters } from '@ansible/common-ui/PersistentFilters';
import { ButtonVariant } from '@patternfly/react-core';
import { CubesIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxView } from '../../../common/useAwxView';
import { AwxHost } from '../../../interfaces/AwxHost';
import { ActionsResponse, OptionsResponse } from '../../../interfaces/OptionsResponse';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useHostsActions } from '../../hosts/hooks/useHostsActions';
import { useHostsFilters } from '../../hosts/hooks/useHostsFilters';
import { useInventoriesHostsColumns } from '../hooks/useInventoriesHostsColumns';
import { useInventoriesHostsToolbarActions } from '../hooks/useInventoriesHostsToolbarActions';

export function InventoryHosts() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const toolbarFilters = useHostsFilters();
  const tableColumns = useInventoriesHostsColumns();
  const params = useParams<{ id: string; inventory_type: string }>();
  const view = useAwxView<AwxHost>({
    url: awxAPI`/inventories/${params.id ?? ''}/hosts/`,
    toolbarFilters,
    tableColumns,
  });
  const toolbarActions = useInventoriesHostsToolbarActions(view);
  const rowActions = useHostsActions(view.unselectItemsAndRefresh, view.updateItem);

  const hostOptions = useOptions<OptionsResponse<ActionsResponse>>(awxAPI`/hosts/`).data;
  const canCreateHost = Boolean(
    hostOptions &&
      hostOptions.actions &&
      hostOptions.actions['POST'] &&
      params.inventory_type === 'inventory'
  );

  let emptyStateTitle = '';
  let emptyStateDescription = '';

  if (params.inventory_type === 'inventory') {
    emptyStateTitle = canCreateHost
      ? t('There are currently no hosts added to this inventory.')
      : t('You do not have permission to create a host.');

    emptyStateDescription = canCreateHost
      ? t('Please create a host by using the button below.')
      : t('Please contact your organization administrator if there is an issue with your access.');
  } else {
    emptyStateTitle = t('No hosts found');
    emptyStateDescription = t('Please add hosts to populate this list');
  }

  usePersistentFilters('inventories');
  return (
    <PageLayout>
      <PageTable<AwxHost>
        id="awx-inventory-hosts-table"
        toolbarFilters={toolbarFilters}
        toolbarActions={toolbarActions}
        tableColumns={tableColumns}
        rowActions={rowActions}
        errorStateTitle={t('Error loading inventory hosts')}
        emptyState={
          canCreateHost ? (
            <PageTableEmptyState title={emptyStateTitle} description={emptyStateDescription}>
              <ButtonLink
                variant={ButtonVariant.primary}
                icon={<PlusCircleIcon />}
                href={getPageUrl(AwxRoute.InventoryHostAdd, {
                  params: { id: params.id, inventory_type: params.inventory_type },
                })}
              >
                {t('Create host')}
              </ButtonLink>
            </PageTableEmptyState>
          ) : (
            <PageTableEmptyState
              icon={CubesIcon}
              title={emptyStateTitle}
              description={emptyStateDescription}
            />
          )
        }
        {...view}
      />
    </PageLayout>
  );
}
