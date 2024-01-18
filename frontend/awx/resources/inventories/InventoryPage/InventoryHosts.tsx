import { CubesIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageHeader, PageLayout, PageTable, usePageNavigate } from '../../../../../framework';
import { useOptions } from '../../../../common/crud/useOptions';
import { usePersistentFilters } from '../../../../common/PersistentFilters';
import { awxAPI } from '../../../common/api/awx-utils';
import { AwxRoute } from '../../../main/AwxRoutes';
import { AwxHost } from '../../../interfaces/AwxHost';
import { OptionsResponse, ActionsResponse } from '../../../interfaces/OptionsResponse';
import { useAwxView } from '../../../common/useAwxView';
import { useHostsFilters } from '../../hosts/hooks/useHostsFilters';
import { useInventoriesHostsToolbarActions } from '../hooks/useInventoriesHostsToolbarActions';
import { useInventoriesHostsActions } from '../hooks/useInventoriesHostsActions';
import { useInventoriesHostsColumns } from '../hooks/useInventoriesHostsColumns';

export function InventoryHosts() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const toolbarFilters = useHostsFilters();
  const tableColumns = useInventoriesHostsColumns();
  const params = useParams<{ id: string; inventory_type: string }>();
  const view = useAwxView<AwxHost>({
    url: awxAPI`/inventories/${params.id ?? ''}/hosts`,
    toolbarFilters,
    tableColumns,
  });
  const toolbarActions = useInventoriesHostsToolbarActions(view);
  const rowActions = useInventoriesHostsActions(view.unselectItemsAndRefresh);

  const hostOptions = useOptions<OptionsResponse<ActionsResponse>>(awxAPI`/hosts`).data;
  const canCreateHost = Boolean(hostOptions && hostOptions.actions && hostOptions.actions['POST']);

  usePersistentFilters('inventories');

  return (
    <PageLayout>
      <PageHeader
        title={t('Inventory Hosts')}
        titleHelpTitle={t('Inventory Hosts')}
        description={t('The list of hosts in the current inventory')}
      />
      <PageTable<AwxHost>
        id="awx-inventory-hosts-table"
        toolbarFilters={toolbarFilters}
        toolbarActions={toolbarActions}
        tableColumns={tableColumns}
        rowActions={rowActions}
        errorStateTitle={t('Error loading inventory hosts')}
        emptyStateTitle={
          canCreateHost
            ? t('There are currently no hosts added to this inventory.')
            : t('You do not have permission to create a host')
        }
        emptyStateDescription={
          canCreateHost
            ? t('Please create a host by using the button below.')
            : t(
                'Please contact your organization administrator if there is an issue with your access.'
              )
        }
        emptyStateIcon={canCreateHost ? undefined : CubesIcon}
        emptyStateButtonText={canCreateHost ? t('Create host') : undefined}
        emptyStateButtonClick={
          canCreateHost
            ? () =>
                pageNavigate(AwxRoute.InventoryHostsAdd, {
                  params: { id: params.id, inventory_type: params.inventory_type },
                })
            : undefined
        }
        {...view}
      />
    </PageLayout>
  );
}
