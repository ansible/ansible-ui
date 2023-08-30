/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageHeader, PageLayout } from '../../../../../framework';
import { LoadingPage } from '../../../../../framework/components/LoadingPage';
import { PageNotImplemented } from '../../../../common/PageNotImplemented';
import { PageBackTab, RoutedTab, RoutedTabs } from '../../../../common/RoutedTabs';
import { RouteObj } from '../../../../common/Routes';
import { useGetItem } from '../../../../common/crud/useGet';
import { AwxError } from '../../../common/AwxError';
import { CredentialType } from '../../../interfaces/CredentialType';

export function CredentialTypePage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const {
    error,
    data: credential_type,
    refresh,
  } = useGetItem<CredentialType>('/api/v2/credential_types', params.id);

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!credential_type) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader
        title={credential_type?.name}
        breadcrumbs={[
          { label: t('Credential Types'), to: RouteObj.CredentialTypes },
          { label: credential_type?.name },
        ]}
        headerActions={[]}
      />
      <RoutedTabs isLoading={!credential_type} baseUrl={RouteObj.CredentialTypePage}>
        <PageBackTab
          label={t('Back to Credential Types')}
          url={RouteObj.CredentialTypes}
          persistentFilterKey="credential_types"
        />
        <RoutedTab label={t('Details')} url={RouteObj.CredentialTypeDetails}>
          <PageNotImplemented />
        </RoutedTab>
      </RoutedTabs>
    </PageLayout>
  );
}
