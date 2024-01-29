import { CubesIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageHeader, PageLayout, PageTable, usePageNavigate } from '../../../../../framework';
import { useOptions } from '../../../../common/crud/useOptions';
import { usePersistentFilters } from '../../../../common/PersistentFilters';
import { awxAPI } from '../../../common/api/awx-utils';
import { AwxRoute } from '../../../main/AwxRoutes';
import { InventorySource } from '../../../interfaces/InventorySource';
import { OptionsResponse, ActionsResponse } from '../../../interfaces/OptionsResponse';
import { useAwxView } from '../../../common/useAwxView';
import { useInventorySourceFilters } from '../hooks/useInventorySourceFilters';
import { useInventoriesSourcesToolbarActions } from '../hooks/useInventoriesSourcesToolbarActions';
import { useInventorySourceActions } from '../hooks/useInventorySourceActions';
import { useInventorySourceColumns } from '../hooks/useInventorySourceColumns';

export function InventorySources() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const toolbarFilters = useInventorySourceFilters();
  const tableColumns = useInventorySourceColumns();
  const params = useParams<{ id: string; inventory_type: string }>();
  const view = useAwxView<InventorySource>({
    url: awxAPI`/inventories/${params.id ?? ''}/inventory_sources`,
    toolbarFilters,
    tableColumns,
  });

  const toolbarActions = useInventoriesSourcesToolbarActions(view);
  const rowActions = useInventorySourceActions({
    onInventorySourcesDeleted: view.unselectItemsAndRefresh,
  });

  const sourceOptions = useOptions<OptionsResponse<ActionsResponse>>(
    awxAPI`/inventory_sources`
  ).data;
  const canCreateSource = Boolean(
    sourceOptions && sourceOptions.actions && sourceOptions.actions['POST']
  );

  usePersistentFilters('inventories');

  return (
    <PageLayout>
      <PageHeader
        title={t('Inventory sources')}
        titleHelpTitle={t('Inventory sources')}
        description={t('The list of sources in the current inventory')}
      />
      <PageTable<InventorySource>
        id="awx-inventory-sources-table"
        toolbarFilters={toolbarFilters}
        toolbarActions={toolbarActions}
        tableColumns={tableColumns}
        rowActions={rowActions}
        errorStateTitle={t('Error loading inventory sources')}
        emptyStateTitle={
          canCreateSource
            ? t('There are currently no sources added to this inventory.')
            : t('You do not have permission to create a host')
        }
        emptyStateDescription={
          canCreateSource
            ? t('Please create a source by using the button below.')
            : t(
                'Please contact your organization administrator if there is an issue with your access.'
              )
        }
        emptyStateIcon={canCreateSource ? undefined : CubesIcon}
        emptyStateButtonText={canCreateSource ? t('Create source') : undefined}
        emptyStateButtonClick={
          canCreateSource
            ? () =>
                pageNavigate(AwxRoute.InventorySourcesAdd, {
                  params: { id: params.id, inventory_type: params.inventory_type },
                })
            : undefined
        }
        {...view}
      />
    </PageLayout>
  );
}
