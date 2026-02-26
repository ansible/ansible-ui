import {
  PageTable,
  useGetPageUrl,
  PageLayoutWithUnauthorized,
} from '@ansible/ansible-ui-framework';
import { PageTableEmptyState } from '@ansible/ansible-ui-framework/PageTable/PageTableEmptyState';
import { ButtonLink } from '@ansible/ansible-ui-framework/components/ButtonLink';
import { useGetDocsUrl } from '@ansible/common-ui/utils/useGetDocsUrl';
import { ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { filterInsightsBulkActions } from '../../common/isInsights';
import { hubAPI } from '../../common/api/formatPath';
import { pulpHrefKeyFn } from '../../common/api/hub-api-utils';
import { useHubConfig } from '../../common/useHubConfig';
import { useHubView } from '../../common/useHubView';
import { isAccessDeniedError } from '../../common/utils/errorUtils';
import { HubRoute } from '../../main/HubRoutes';
import { RemoteRegistry } from './RemoteRegistry';
import { useRemoteRegistriesColumns } from './hooks/useRemoteRegistriesColumns';
import { useRemoteRegistriesToolbarActions } from './hooks/useRemoteRegistriesToolbarActions';
import { useRemoteRegistryActions } from './hooks/useRemoteRegistryActions';
import { useRemoteRegistryFilters } from './hooks/useRemoteRegistryFilters';

export function RemoteRegistries() {
  const { t } = useTranslation();
  const toolbarFilters = useRemoteRegistryFilters();
  const tableColumns = useRemoteRegistriesColumns();
  const config = useHubConfig();
  const docsUrl = useGetDocsUrl(config, 'remoteRegistries');
  const getPageUrl = useGetPageUrl();

  const view = useHubView<RemoteRegistry>({
    url: hubAPI`/_ui/v1/execution-environments/registries/`,
    keyFn: pulpHrefKeyFn,
    toolbarFilters,
    tableColumns,
  });

  const allToolbarActions = useRemoteRegistriesToolbarActions(view);
  const toolbarActions = useMemo(
    () => filterInsightsBulkActions(allToolbarActions),
    [allToolbarActions]
  );
  const rowActions = useRemoteRegistryActions({
    onRemoteRegistryDeleted: view.unselectItemsAndRefresh,
    refresh: view.refresh,
  });

  // Check if the error is a 403 access denied error
  const isUnauthorized = isAccessDeniedError(view.error);

  const description = t(
    'Remote registries manage configurations for remote execution environments utilized in Ansible automation tasks.'
  );

  return (
    <PageLayoutWithUnauthorized
      isUnauthorized={isUnauthorized}
      resourceName={t('Remote Registries')}
      title={t('Remote Registries')}
      titleHelpTitle={t('Remote Registries')}
      titleHelp={description}
      description={description}
      titleDocLink={docsUrl}
    >
      <PageTable<RemoteRegistry>
        id="hub-remote-registries-table"
        defaultSubtitle={t('Remote Registry')}
        emptyState={
          <PageTableEmptyState
            title={t('No remote registries yet')}
            description={t(
              'You can create a remote registry to manage configurations for remote execution environments.'
            )}
          >
            <ButtonLink
              icon={<PlusCircleIcon />}
              variant={ButtonVariant.primary}
              href={getPageUrl(HubRoute.CreateRemoteRegistry)}
              data-cy="create-remote-registry"
              data-testid="create-remote-registry"
            >
              {t('Create remote registry')}
            </ButtonLink>
          </PageTableEmptyState>
        }
        errorStateTitle={t('Error loading remote registries')}
        rowActions={rowActions}
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        toolbarFilters={toolbarFilters}
        {...view}
      />
    </PageLayoutWithUnauthorized>
  );
}
