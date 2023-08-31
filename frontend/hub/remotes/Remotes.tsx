import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable } from '../../../framework';
import { usePulpView } from '../usePulpView';
import { pulpAPI, pulpHrefKeyFn } from '../api/utils';
import { useRemoteActions } from './hooks/useRemoteActions';
import { useRemoteColumns } from './hooks/useRemoteColumns';
import { useRemoteFilters } from './hooks/useRemoteFilters';
import { useRemoteToolbarActions } from './hooks/useRemoteToolbarActions';
import { useNavigate } from 'react-router-dom';
import { RouteObj } from '../../Routes';

export interface IRemotes {
  auth_url?: string | null;
  ca_cert?: string | null;
  client_cert: string | null;
  download_concurrency: number | null;
  name: string;
  proxy_url?: string | null;
  pulp_href: string;
  rate_limit: number | null;
  requirements_file: string | null;
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
    url: pulpAPI`/remotes/`,
    keyFn: pulpHrefKeyFn,
    toolbarFilters,
    tableColumns,
  });
  const toolbarActions = useRemoteToolbarActions(view);
  const rowActions = useRemoteActions(view);

  const navigate = useNavigate();
  return (
    <PageLayout>
      <PageHeader title={t('Remotes')} description={t('Remotes')} />
      <PageTable<IRemotes>
        defaultSubtitle={t('Remote')}
        emptyStateButtonClick={() => navigate(RouteObj.CreateRemotes)}
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
