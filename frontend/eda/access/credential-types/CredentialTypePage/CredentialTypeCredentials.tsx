import { CubesIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { useCredentialTypeCredentialsColumns } from '../hooks/useCredentialTypeCredentialsColumns';
import { useCredentialTypeCredentialsFilters } from '../hooks/useCredentialTypeCredentialsFilters';
import { useEdaView } from '../../../common/useEventDrivenView';
import { edaAPI } from '../../../common/eda-utils';
import { EdaCredential } from '../../../interfaces/EdaCredential';
import { PageLayout, PageTable } from '../../../../../framework';
import { useCredentialsActions } from '../../credentials/hooks/useCredentialsActions';
import { useCredentialActions } from '../../credentials/hooks/useCredentialActions';

export function CredentialTypeCredentials() {
  const params = useParams<{ id: string }>();
  const { t } = useTranslation();

  const toolbarFilters = useCredentialTypeCredentialsFilters();
  const tableColumns = useCredentialTypeCredentialsColumns();
  const view = useEdaView<EdaCredential>({
    url: edaAPI`/eda-credentials/`,
    queryParams: { credential_type_id: `${params?.id || ''}` },
    toolbarFilters,
    tableColumns,
  });
  const toolbarActions = useCredentialsActions(view);
  const rowActions = useCredentialActions(view);
  return (
    <PageLayout>
      <PageTable
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        toolbarFilters={toolbarFilters}
        rowActions={rowActions}
        errorStateTitle={t('Error loading credentials for this type')}
        emptyStateTitle={t('No credentials for this type')}
        emptyStateIcon={CubesIcon}
        emptyStateDescription={t('No credentials for this type')}
        {...view}
        defaultSubtitle={t('Credentials')}
      />
    </PageLayout>
  );
}
