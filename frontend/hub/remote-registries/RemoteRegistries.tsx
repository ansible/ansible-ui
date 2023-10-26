import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable } from '../../../framework';
import { hubAPI, pulpHrefKeyFn } from '../api/utils';
import { useHubView } from '../useHubView';
import { RemoteRegistry } from './RemoteRegistry';
import { useRemoteRegistriesColumns } from './hooks/useRemoteRegistriesColumns';
import { useRemoteRegistriesToolbarActions } from './hooks/useRemoteRegistriesToolbarActions';
import { useRemoteRegistryActions } from './hooks/useRemoteRegistryActions';
import { useRemoteRegistryFilters } from './hooks/useRemoteRegistryFilters';

export function RemoteRegistries() {
  const { t } = useTranslation();
  const toolbarFilters = useRemoteRegistryFilters();
  const tableColumns = useRemoteRegistriesColumns();
  const view = useHubView<RemoteRegistry>({
    url: hubAPI`/_ui/v1/execution-environments/registries/`,
    keyFn: pulpHrefKeyFn,
    toolbarFilters,
    tableColumns,
  });
  const toolbarActions = useRemoteRegistriesToolbarActions();
  const rowActions = useRemoteRegistryActions();
  return (
    <PageLayout>
      <PageHeader
        title={t('Remote Registries')}
        description={t(
          'Remote registries are external sources that provide a central location for users to search, retrieve, and install Ansible roles and collections.'
        )}
      />
      <PageTable<RemoteRegistry>
        id="hub-remote-registries-table"
        toolbarFilters={toolbarFilters}
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        rowActions={rowActions}
        errorStateTitle={t('Error loading remote registries')}
        emptyStateTitle={t('No remote registries yet')}
        {...view}
        defaultSubtitle={t('Remote Registry')}
      />
    </PageLayout>
  );
}
