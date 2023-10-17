/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageHeader, PageLayout, useGetPageUrl } from '../../../../../framework';
import { LoadingPage } from '../../../../../framework/components/LoadingPage';
import { PageRoutedTabs } from '../../../../../framework/PageTabs/PageRoutedTabs';
import { useGetItem } from '../../../../common/crud/useGet';
import { AwxRoute } from '../../../AwxRoutes';
import { AwxError } from '../../../common/AwxError';
import { CredentialType } from '../../../interfaces/CredentialType';

export function CredentialTypePage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const {
    error,
    data: credentialType,
    refresh,
  } = useGetItem<CredentialType>('/api/v2/credential_types', params.id);

  const getPageUrl = useGetPageUrl();

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!credentialType) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader
        title={credentialType?.name}
        breadcrumbs={[
          { label: t('Credential Types'), to: getPageUrl(AwxRoute.CredentialTypes) },
          { label: credentialType?.name },
        ]}
        headerActions={[]}
      />
      <PageRoutedTabs
        backTab={{
          label: t('Back to Credential Types'),
          page: AwxRoute.CredentialTypes,
          persistentFilterKey: 'credential-types',
        }}
        tabs={[
          { label: t('Details'), page: AwxRoute.CredentialTypeDetails },
          { label: t('Credentials'), page: AwxRoute.CredentialTypeCredentials },
        ]}
        params={{ id: credentialType.id }}
      />
    </PageLayout>
  );
}
