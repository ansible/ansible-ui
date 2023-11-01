import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable, usePageNavigate } from '../../../../framework';
import { EdaRoute } from '../../EdaRoutes';
import { EdaCredential } from '../../interfaces/EdaCredential';
import { useEdaView } from '../../useEventDrivenView';
import { useCredentialActions } from './hooks/useCredentialActions';
import { useCredentialColumns } from './hooks/useCredentialColumns';
import { useCredentialFilters } from './hooks/useCredentialFilters';
import { useCredentialsActions } from './hooks/useCredentialsActions';
import { edaAPI } from '../../api/eda-utils';

export function Credentials() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const toolbarFilters = useCredentialFilters();
  const tableColumns = useCredentialColumns();
  const view = useEdaView<EdaCredential>({
    url: edaAPI`/credentials/`,
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
        id="eda-credentials-table"
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        toolbarFilters={toolbarFilters}
        rowActions={rowActions}
        errorStateTitle={t('Error loading credentials')}
        emptyStateTitle={t('There are currently no credentials created for your organization.')}
        emptyStateDescription={t('Please create a credential by using the button below.')}
        emptyStateButtonText={t('Create credential')}
        emptyStateButtonClick={() => pageNavigate(EdaRoute.CreateCredential)}
        {...view}
        defaultSubtitle={t('Credential')}
      />
    </PageLayout>
  );
}
