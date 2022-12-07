import { useTranslation } from 'react-i18next';
import { TablePage } from '../../../../framework';
import { pkKeyFn, useHubView } from '../../useHubView';
import { useRemoteRegistriesActions } from './hooks/useRemoteRegistriesActions';
import { useRemoteRegistriesColumns } from './hooks/useRemoteRegistriesColumns';
import { useRemoteRegistryActions } from './hooks/useRemoteRegistryActions';
import { useRemoteRegistryFilters } from './hooks/useRemoteRegistryFilters';
import { RemoteRegistry } from './RemoteRegistry';

export function RemoteRegistries() {
  const { t } = useTranslation();
  const toolbarFilters = useRemoteRegistryFilters();
  const tableColumns = useRemoteRegistriesColumns();
  const view = useHubView<RemoteRegistry>(
    '/api/automation-hub/_ui/v1/execution-environments/registries/',
    pkKeyFn,
    toolbarFilters,
    tableColumns
  );
  const toolbarActions = useRemoteRegistriesActions();
  const rowActions = useRemoteRegistryActions();
  return (
    <TablePage<RemoteRegistry>
      title={t('Remote registries')}
      toolbarFilters={toolbarFilters}
      tableColumns={tableColumns}
      toolbarActions={toolbarActions}
      rowActions={rowActions}
      errorStateTitle={t('Error loading remote registries')}
      emptyStateTitle={t('No remote registries yet')}
      {...view}
    />
  );
}
