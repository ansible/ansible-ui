import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable, usePageNavigate } from '../../../framework';
import { HubRoute } from '../HubRoutes';
import { pulpAPI, pulpHrefKeyFn } from '../api/utils';
import { usePulpView } from '../usePulpView';
import { useRemoteActions } from './hooks/useRemoteActions';
import { useRemoteColumns } from './hooks/useRemoteColumns';
import { useRemoteFilters } from './hooks/useRemoteFilters';
import { useRemoteToolbarActions } from './hooks/useRemoteToolbarActions';

export interface IRemotes {
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
  hidden_fields?: {
    is_set: boolean;
    name: string;
  }[];
  my_permissions?: string[];
}

export function Remotes() {
  const { t } = useTranslation();
  const toolbarFilters = useRemoteFilters();
  const tableColumns = useRemoteColumns();
  const view = usePulpView<IRemotes>({
    url: pulpAPI`/remotes/ansible/collection/`,
    keyFn: pulpHrefKeyFn,
    toolbarFilters,
    tableColumns,
  });
  const toolbarActions = useRemoteToolbarActions(view);
  const rowActions = useRemoteActions(view);

  const pageNavigate = usePageNavigate();
  return (
    <PageLayout>
      <PageHeader title={t('Remotes')} description={t('Remotes')} />
      <PageTable<IRemotes>
        id="hub-remotes-table"
        defaultSubtitle={t('Remote')}
        emptyStateButtonClick={() => pageNavigate(HubRoute.CreateRemote)}
        emptyStateButtonText={t('Create remote')}
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
