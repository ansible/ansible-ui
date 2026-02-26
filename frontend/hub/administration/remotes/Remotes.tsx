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
import { pulpAPI } from '../../common/api/formatPath';
import { pulpHrefKeyFn } from '../../common/api/hub-api-utils';
import { useHubConfig } from '../../common/useHubConfig';
import { useHubView } from '../../common/useHubView';
import { isAccessDeniedError } from '../../common/utils/errorUtils';
import { HubRoute } from '../../main/HubRoutes';
import { useRemoteActions } from './hooks/useRemoteActions';
import { useRemoteColumns } from './hooks/useRemoteColumns';
import { useRemoteFilters } from './hooks/useRemoteFilters';
import { useRemoteToolbarActions } from './hooks/useRemoteToolbarActions';

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
  const docsUrl = useGetDocsUrl(config, 'remotes');

  const view = useHubView<HubRemote>({
    url: pulpAPI`/remotes/ansible/collection/`,
    keyFn: pulpHrefKeyFn,
    toolbarFilters,
    tableColumns,
  });
  const allToolbarActions = useRemoteToolbarActions(view);
  const toolbarActions = useMemo(
    () => filterInsightsBulkActions(allToolbarActions),
    [allToolbarActions]
  );
  const rowActions = useRemoteActions({ onRemotesDeleted: view.unselectItemsAndRefresh });

  // Check if the error is a 403 access denied error
  const isUnauthorized = isAccessDeniedError(view.error);

  const description = t(
    'Remotes are external sources that provide a central location for users to search, retrieve, and install Ansible roles and collections.'
  );

  return (
    <PageLayoutWithUnauthorized
      isUnauthorized={isUnauthorized}
      resourceName={t('Remotes')}
      title={t('Remotes')}
      description={description}
      titleHelpTitle={t('Remotes')}
      titleHelp={description}
      titleDocLink={docsUrl}
    >
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
    </PageLayoutWithUnauthorized>
  );
}
