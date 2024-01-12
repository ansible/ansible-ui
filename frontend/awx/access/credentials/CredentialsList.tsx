import { useTranslation } from 'react-i18next';
import { PageTable, usePageNavigate } from '../../../../framework';
import { useAwxView } from '../../common/useAwxView';
import { Credential } from '../../interfaces/Credential';
import { AwxRoute } from '../../main/AwxRoutes';
import { useCredentialActions } from './hooks/useCredentialActions';
import { useCredentialToolbarActions } from './hooks/useCredentialToolbarActions';
import { useCredentialsColumns } from './hooks/useCredentialsColumns';
import { useCredentialsFilters } from './hooks/useCredentialsFilters';

export function CredentialsList(props: { url: string }) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const toolbarFilters = useCredentialsFilters();
  const tableColumns = useCredentialsColumns();

  const view = useAwxView<Credential>({
    url: props.url,
    toolbarFilters,
    tableColumns,
  });
  const toolbarActions = useCredentialToolbarActions(view);
  const rowActions = useCredentialActions({ onDeleted: () => void view.refresh() });

  return (
    <PageTable<Credential>
      id="awx-credentials-table"
      toolbarFilters={toolbarFilters}
      toolbarActions={toolbarActions}
      tableColumns={tableColumns}
      rowActions={rowActions}
      errorStateTitle={t('Error loading credentials')}
      emptyStateTitle={t('No credentials yet')}
      emptyStateDescription={t('To get started, create an credential.')}
      emptyStateButtonText={t('Create credential')}
      emptyStateButtonClick={() => pageNavigate(AwxRoute.CreateCredential)}
      {...view}
      defaultSubtitle={t('Credential')}
    />
  );
}
