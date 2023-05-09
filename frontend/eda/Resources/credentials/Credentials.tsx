import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageHeader, PageLayout, PageTable } from '../../../../framework';
import { RouteObj } from '../../../Routes';
import { EdaCredential } from '../../interfaces/EdaCredential';
import { useCredentialActions } from './hooks/useCredentialActions';
import { useCredentialColumns } from './hooks/useCredentialColumns';
import { useCredentialFilters } from './hooks/useCredentialFilters';
import { useCredentialsActions } from './hooks/useCredentialsActions';
import { API_PREFIX } from '../../constants';
import { useEdaView } from '../../useEventDrivenView';

export function Credentials() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toolbarFilters = useCredentialFilters();
  const tableColumns = useCredentialColumns();
  const view = useEdaView<EdaCredential>({
    url: `${API_PREFIX}/credentials/`,
    toolbarFilters,
    tableColumns,
  });
  const toolbarActions = useCredentialsActions(view);
  const rowActions = useCredentialActions(view);
  return (
    <PageLayout>
      <PageHeader
        title={t('Credentials')}
        description={t(
          'Credentials are utilized by EDA for authentication when launching rulebooks.'
        )}
      />
      <PageTable
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        toolbarFilters={toolbarFilters}
        rowActions={rowActions}
        errorStateTitle={t('Error loading credentials')}
        emptyStateTitle={t('No credentials yet')}
        emptyStateDescription={t('To get started, create a credential.')}
        emptyStateButtonText={t('Create credential')}
        emptyStateButtonClick={() => navigate(RouteObj.CreateEdaCredential)}
        {...view}
        defaultSubtitle={t('Credential')}
      />
    </PageLayout>
  );
}
