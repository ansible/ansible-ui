import { CubesIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageTable } from '../../../../framework';
import { useOptions } from '../../../common/crud/useOptions';
import { usePersistentFilters } from '../../../common/PersistentFilters';
import { awxAPI } from '../../common/api/awx-utils';
import { AwxHost } from '../../interfaces/AwxHost';
import { OptionsResponse, ActionsResponse } from '../../interfaces/OptionsResponse';
import { useAwxView } from '../../common/useAwxView';
import { useHostsFilters } from '../hosts/hooks/useHostsFilters';
import { useInventoriesGroupHostsColumns } from '../inventories/hooks/useInventoriesHostsColumns';
import { useHostsEmptyStateActions } from '../hosts/hooks/useHostsEmptyStateActions';
import { useInventoriesGroupsHostsToolbarActions } from '../inventories/hooks/useInventoriesGroupsHostsToolbarActions';
import { useInventoriesGroupsHostsActions } from '../inventories/hooks/useInventoriesGroupsHostsActions';

export function GroupHosts() {
  const { t } = useTranslation();
  const toolbarFilters = useHostsFilters();
  const tableColumns = useInventoriesGroupHostsColumns();
  const params = useParams<{ id: string; group_id: string; inventory_type: string }>();
  const view = useAwxView<AwxHost>({
    url: awxAPI`/groups/${params.group_id ?? ''}/all_hosts/`,
    toolbarFilters,
    tableColumns,
  });
  const toolbarActions = useInventoriesGroupsHostsToolbarActions(view);
  const rowActions = useInventoriesGroupsHostsActions(view.refresh);
  const emptyStateActions = useHostsEmptyStateActions(view);

  const hostOptions = useOptions<OptionsResponse<ActionsResponse>>(awxAPI`/hosts/`).data;
  const canCreateHost = Boolean(hostOptions && hostOptions.actions && hostOptions.actions['POST']);

  usePersistentFilters('inventories');

  return (
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
          ? t('Please add hosts by using the button below.')
          : t(
              'Please contact your organization administrator if there is an issue with your access.'
            )
      }
      emptyStateIcon={canCreateHost ? undefined : CubesIcon}
      emptyStateButtonIcon={<PlusCircleIcon />}
      emptyStateButtonText={canCreateHost ? t('Create host') : undefined}
      emptyStateActions={emptyStateActions}
      {...view}
    />
  );
}
