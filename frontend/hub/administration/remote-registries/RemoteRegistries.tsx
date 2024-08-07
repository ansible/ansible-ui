import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable, usePageNavigate } from '../../../../framework';
import { hubAPI } from '../../common/api/formatPath';
import { pulpHrefKeyFn } from '../../common/api/hub-api-utils';
import { useHubView } from '../../common/useHubView';
import { HubRoute } from '../../main/HubRoutes';
import { RemoteRegistry } from './RemoteRegistry';
import { useRemoteRegistriesColumns } from './hooks/useRemoteRegistriesColumns';
import { useRemoteRegistriesToolbarActions } from './hooks/useRemoteRegistriesToolbarActions';
import { useRemoteRegistryActions } from './hooks/useRemoteRegistryActions';
import { useRemoteRegistryFilters } from './hooks/useRemoteRegistryFilters';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { Icon } from '@patternfly/react-core';

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
  const pageNavigate = usePageNavigate();
  const toolbarActions = useRemoteRegistriesToolbarActions(view);
  const rowActions = useRemoteRegistryActions({
    onRemoteRegistryDeleted: view.unselectItemsAndRefresh,
    refresh: view.refresh,
  });
  return (
    <PageLayout>
      <PageHeader
        title={t('Remote Registries')}
        description={t(
          'Remote registries are external sources that provide a central location for users to search, retrieve, and install Ansible roles and collections.'
        )}
        titleHelpTitle={t('Remote Registries')}
        titleHelp={t(
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
        emptyStateButtonIcon={
          <Icon>
            <PlusCircleIcon />
          </Icon>
        }
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
