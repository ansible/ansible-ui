import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable } from '../../../framework';
import { usePulpView } from '../usePulpView';
import { pulpAPI, pulpHrefKeyFn } from '../api';
import { useRemoteActions } from './hooks/useRemoteActions';
import { useRemoteColumns } from './hooks/useRemoteColumns';
import { useRemoteFilters } from './hooks/useRemoteFilters';

export interface IRemotes {
  pulp_href: string;
  pulp_created: string;
  name: string;
  url: string;
  ca_cert: string;
  client_cert: string;
  client_key: string;
  tls_validation: boolean;
  proxy_url: string;
  pulp_labels: unknown;
  pulp_last_updated: string;
  download_concurrency: number;
  max_retries: number;
  policy: 'immediate';
  total_timeout: number;
  connect_timeout: number;
  sock_connect_timeout: number;
  sock_read_timeout: number;
  headers: string;
  rate_limit: number;
  hidden_fields: {
    name: string;
    is_set: boolean;
  }[];
  requirements_file: string;
  auth_url: string;
  signed_only: boolean;
  last_sync_task: string;
}

export function Remotes() {
  const { t } = useTranslation();
  const toolbarFilters = useRemoteFilters();
  const tableColumns = useRemoteColumns();
  const toolbarActions = useRemoteActions();
  const view = usePulpView<IRemotes>({
    url: pulpAPI`/remotes/`,
    keyFn: pulpHrefKeyFn,
    toolbarFilters,
    tableColumns,
  });

  return (
    <PageLayout>
      <PageHeader title={t('Remotes')} description={t('Remotes')} />
      <PageTable<IRemotes>
        toolbarFilters={toolbarFilters}
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        errorStateTitle={t('Error loading remotes')}
        emptyStateTitle={t('No remotes yet')}
        defaultSubtitle={t('Remote')}
        {...view}
      />
    </PageLayout>
  );
}
