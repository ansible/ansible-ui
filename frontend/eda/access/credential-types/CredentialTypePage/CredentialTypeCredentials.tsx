import { CubesIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { useCredentialTypeCredentialsColumns } from '../hooks/useCredentialTypeCredentialsColumns';
import { useCredentialTypeCredentialsFilters } from '../hooks/useCredentialTypeCredentialsFilters';
import { useEdaView } from '../../../common/useEventDrivenView';
import { edaAPI } from '../../../common/eda-utils';
import { EdaCredential } from '../../../interfaces/EdaCredential';
import { PageLayout, PageTable } from '../../../../../framework';

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
  return (
    <PageLayout>
      <PageTable
        tableColumns={tableColumns}
        toolbarFilters={toolbarFilters}
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
