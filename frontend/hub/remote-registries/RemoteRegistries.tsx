import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable, usePageNavigate } from '../../../framework';
import { HubRoute } from '../HubRoutes';
import { hubAPI } from '../api/formatPath';
import { pulpHrefKeyFn } from '../api/utils';
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
  const pageNavigate = usePageNavigate();
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
        defaultSubtitle={t('Remote Registry')}
        emptyStateButtonClick={() => {
          pageNavigate(HubRoute.CreateRemoteRegistry);
        }}
        emptyStateButtonText={t('Create remote registry')}
        emptyStateTitle={t('No remote registries yet')}
        errorStateTitle={t('Error loading remote registries')}
        rowActions={rowActions}
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        toolbarFilters={toolbarFilters}
        {...view}
      />
    </PageLayout>
  );
}
