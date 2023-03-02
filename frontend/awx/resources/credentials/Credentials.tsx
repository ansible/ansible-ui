import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageHeader, PageLayout, PageTable } from '../../../../framework';
import { ItemDescriptionExpandedRow } from '../../../common/ItemDescriptionExpandedRow';
import { RouteObj } from '../../../Routes';
import { Credential } from '../../interfaces/Credential';
import { useAwxView } from '../../useAwxView';
import { useCredentialActions } from './hooks/useCredentialActions';
import { useCredentialsColumns } from './hooks/useCredentialsColumns';
import { useCredentialsFilters } from './hooks/useCredentialsFilters';
import { useCredentialToolbarActions } from './hooks/useCredentialToolbarActions';

export function Credentials() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toolbarFilters = useCredentialsFilters();
  const tableColumns = useCredentialsColumns();
  const view = useAwxView<Credential>({
    url: '/api/v2/credentials/',
    toolbarFilters,
    tableColumns,
  });
  const toolbarActions = useCredentialToolbarActions(view);
  const rowActions = useCredentialActions({ onDeleted: () => void view.refresh() });
  return (
    <PageLayout>
      <PageHeader
        title={t('Credentials')}
        titleHelpTitle={t('Credentials')}
        titleHelp={t('credentials.title.help')}
        titleDocLink="https://docs.ansible.com/ansible-tower/latest/html/userguide/credentials.html"
        description={t('credentials.title.description')}
      />
      <PageTable<Credential>
        toolbarFilters={toolbarFilters}
        toolbarActions={toolbarActions}
        tableColumns={tableColumns}
        rowActions={rowActions}
        errorStateTitle={t('Error loading credentials')}
        emptyStateTitle={t('No credentials yet')}
        emptyStateDescription={t('To get started, create an credential.')}
        emptyStateButtonText={t('Create credential')}
        emptyStateButtonClick={() => navigate(RouteObj.CreateCredential)}
        expandedRow={ItemDescriptionExpandedRow<Credential>}
        {...view}
      />
    </PageLayout>
  );
}
