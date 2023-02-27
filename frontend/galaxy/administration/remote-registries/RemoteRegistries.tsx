import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable } from '../../../../framework';
import { pkKeyFn, useGalaxyView } from '../../useGalaxyView';
import { useRemoteRegistriesActions } from './hooks/useRemoteRegistriesActions';
import { useRemoteRegistriesColumns } from './hooks/useRemoteRegistriesColumns';
import { useRemoteRegistryActions } from './hooks/useRemoteRegistryActions';
import { useRemoteRegistryFilters } from './hooks/useRemoteRegistryFilters';
import { RemoteRegistry } from './RemoteRegistry';

export function RemoteRegistries() {
  const { t } = useTranslation();
  const toolbarFilters = useRemoteRegistryFilters();
  const tableColumns = useRemoteRegistriesColumns();
  const view = useGalaxyView<RemoteRegistry>(
    '/api/automation-hub/_ui/v1/execution-environments/registries/',
    pkKeyFn,
    toolbarFilters,
    tableColumns
  );
  const toolbarActions = useRemoteRegistriesActions();
  const rowActions = useRemoteRegistryActions();
  return (
    <PageLayout>
      <PageHeader title={t('Remote registries')} />
      <PageTable<RemoteRegistry>
        toolbarFilters={toolbarFilters}
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        rowActions={rowActions}
        errorStateTitle={t('Error loading remote registries')}
        emptyStateTitle={t('No remote registries yet')}
        {...view}
      />
    </PageLayout>
  );
}
