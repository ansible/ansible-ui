import { PageHeader, PageLayout, PageTable, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { PageTableEmptyState } from '@ansible/ansible-ui-framework/PageTable/PageTableEmptyState';
import { ButtonLink } from '@ansible/ansible-ui-framework/components/ButtonLink';
import { ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { pulpAPI } from '../../common/api/formatPath';
import { pulpHrefKeyFn } from '../../common/api/hub-api-utils';
import { useHubView } from '../../common/useHubView';
import { HubRoute } from '../../main/HubRoutes';
import { useRemoteActions } from './hooks/useRemoteActions';
import { useRemoteColumns } from './hooks/useRemoteColumns';
import { useRemoteFilters } from './hooks/useRemoteFilters';
import { useRemoteToolbarActions } from './hooks/useRemoteToolbarActions';
import { useHubConfig } from '../../common/useHubConfig';
import { useGetDocsUrl } from '@ansible/common-ui/utils/useGetDocsUrl';

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
  requirements_file?: string | null;
  tls_validation: boolean;
  url: string;
  signed_only: boolean;
  sync_dependencies: boolean;
  hidden_fields?: {
    is_set: boolean;
    name: 'client_key' | 'password' | 'proxy_username' | 'proxy_password' | 'token' | 'username';
  }[];
}

export function Remotes() {
  const { t } = useTranslation();
  const toolbarFilters = useRemoteFilters();
  const tableColumns = useRemoteColumns();
  const getPageUrl = useGetPageUrl();
  const config = useHubConfig();
  const view = useHubView<HubRemote>({
    url: pulpAPI`/remotes/ansible/collection/`,
    keyFn: pulpHrefKeyFn,
    toolbarFilters,
    tableColumns,
  });
  const toolbarActions = useRemoteToolbarActions(view);
  const rowActions = useRemoteActions({ onRemotesDeleted: view.unselectItemsAndRefresh });

  return (
    <PageLayout>
      <PageHeader
        title={t('Remotes')}
        description={t(
          'Remotes are external sources that provide a central location for users to search, retrieve, and install Ansible roles and collections.'
        )}
        titleHelpTitle={t('Remotes')}
        titleHelp={t(
          'Remotes are external sources that provide a central location for users to search, retrieve, and install Ansible roles and collections.'
        )}
        titleDocLink={useGetDocsUrl(config, 'remotes')}
      />
      <PageTable<HubRemote>
        id="hub-remotes-table"
        defaultSubtitle={t('Remote')}
        emptyState={
          <PageTableEmptyState
            title={t('No remotes yet')}
            description={t(
              'You can create a remote to provide a central location for users to search, retrieve, and install Ansible roles and collections.'
            )}
          >
            <ButtonLink
              icon={<PlusCircleIcon />}
              variant={ButtonVariant.primary}
              href={getPageUrl(HubRoute.CreateRemote)}
            >
              {t('Create remote')}
            </ButtonLink>
          </PageTableEmptyState>
        }
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
