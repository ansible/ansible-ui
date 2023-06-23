import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable } from '../../../framework';
import { useHubView } from '../useHubView';
import { RemoteRegistry } from './RemoteRegistry';
import { useRemoteRegistriesActions } from './hooks/useRemoteRegistriesActions';
import { useRemoteRegistriesColumns } from './hooks/useRemoteRegistriesColumns';
import { useRemoteRegistryActions } from './hooks/useRemoteRegistryActions';
import { useRemoteRegistryFilters } from './hooks/useRemoteRegistryFilters';
import { hubAPI, pulpHrefKeyFn } from '../api';

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
  const toolbarActions = useRemoteRegistriesActions();
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
