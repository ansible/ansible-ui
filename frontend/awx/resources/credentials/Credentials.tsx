import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable, usePageNavigate } from '../../../../framework';
import { usePersistentFilters } from '../../../common/PersistentFilters';
import { AwxRoute } from '../../AwxRoutes';
import { useAwxConfig } from '../../common/useAwxConfig';
import getDocsBaseUrl from '../../common/util/getDocsBaseUrl';
import { Credential } from '../../interfaces/Credential';
import { useAwxView } from '../../useAwxView';
import { useCredentialActions } from './hooks/useCredentialActions';
import { useCredentialToolbarActions } from './hooks/useCredentialToolbarActions';
import { useCredentialsColumns } from './hooks/useCredentialsColumns';
import { useCredentialsFilters } from './hooks/useCredentialsFilters';

export function Credentials() {
  const { t } = useTranslation();
  const product: string = process.env.PRODUCT ?? t('AWX');
  const pageNavigate = usePageNavigate();
  usePersistentFilters('credentials');
  const toolbarFilters = useCredentialsFilters();
  const tableColumns = useCredentialsColumns();
  const view = useAwxView<Credential>({
    url: '/api/v2/credentials/',
    toolbarFilters,
    tableColumns,
  });
  const toolbarActions = useCredentialToolbarActions(view);
  const rowActions = useCredentialActions({ onDeleted: () => void view.refresh() });
  const config = useAwxConfig();

  return (
    <PageLayout>
      <PageHeader
        title={t('Credentials')}
        titleHelpTitle={t('Credential')}
        titleHelp={t(
          `Credentials are utilized by {{product}} for authentication when launching Jobs against machines, synchronizing with inventory sources, and importing project content from a version control system. You can grant users and teams the ability to use these credentials, without actually exposing the credential to the user. If you have a user move to a different team or leave the organization, you don’t have to re-key all of your systems just because that credential was available in {{product}}.`,
          { product }
        )}
        titleDocLink={`${getDocsBaseUrl(config)}/html/userguide/credentials.html`}
        description={t(
          `Credentials are utilized by {{product}} for authentication when launching Jobs against machines, synchronizing with inventory sources, and importing project content from a version control system.`,
          { product }
        )}
      />
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
    </PageLayout>
  );
}
