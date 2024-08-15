import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable, usePageNavigate } from '../../../../framework';
import { pulpAPI } from '../../common/api/formatPath';
import { pulpHrefKeyFn } from '../../common/api/hub-api-utils';
import { useHubView } from '../../common/useHubView';
import { HubRoute } from '../../main/HubRoutes';
import { useRemoteActions } from './hooks/useRemoteActions';
import { useRemoteColumns } from './hooks/useRemoteColumns';
import { useRemoteFilters } from './hooks/useRemoteFilters';
import { useRemoteToolbarActions } from './hooks/useRemoteToolbarActions';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { Icon } from '@patternfly/react-core';

export interface HubRemote {
  auth_url?: string | null;
  ca_cert?: string | null;
  client_cert: string | null;
  download_concurrency: number | null;
  name: string;
  proxy_url?: string | null;
  pulp_href: string;
  pulp_created: string;
  rate_limit: number | null;
  requirements_file?: string;
  tls_validation: boolean;
  url: string;
  signed_only: boolean;
  sync_dependencies: boolean;
  hidden_fields?: {
    is_set: boolean;
    name: 'client_key' | 'password' | 'proxy_username' | 'proxy_password' | 'token' | 'username';
  }[];
  my_permissions?: string[];
}

export function Remotes() {
  const { t } = useTranslation();
  const toolbarFilters = useRemoteFilters();
  const tableColumns = useRemoteColumns();
  const view = useHubView<HubRemote>({
    url: pulpAPI`/remotes/ansible/collection/`,
    keyFn: pulpHrefKeyFn,
    toolbarFilters,
    tableColumns,
  });
  const toolbarActions = useRemoteToolbarActions(view);
  const rowActions = useRemoteActions({ onRemotesDeleted: view.unselectItemsAndRefresh });

  const pageNavigate = usePageNavigate();
  return (
    <PageLayout>
      <PageHeader
        title={t('Remotes')}
        description={t(
          'Remotes manage configurations for remote execution environments utilized in Ansible automation tasks.'
        )}
        titleHelpTitle={t('Remotes')}
        titleHelp={t(
          'Remotes manage configurations for remote execution environments utilized in Ansible automation tasks.'
        )}
      />
      <PageTable<HubRemote>
        id="hub-remotes-table"
        defaultSubtitle={t('Remote')}
        emptyStateButtonClick={() => pageNavigate(HubRoute.CreateRemote)}
        emptyStateButtonText={t('Create remote')}
        emptyStateButtonIcon={
          <Icon>
            <PlusCircleIcon />
          </Icon>
        }
        emptyStateTitle={t('No remotes yet')}
        errorStateTitle={t('Error loading remotes')}
        rowActions={rowActions}
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        toolbarFilters={toolbarFilters}
        {...view}
      />
    </PageLayout>
  );
}
