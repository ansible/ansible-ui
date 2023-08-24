/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { DropdownPosition } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  PageActions,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../../framework';
import { PageBackTab, RoutedTab, RoutedTabs } from '../../../../common/RoutedTabs';
import { RouteObj } from '../../../../common/Routes';
import { useGetItem } from '../../../../common/crud/useGet';
import { AwxRoute } from '../../../AwxRoutes';
import { Credential } from '../../../interfaces/Credential';
import { useCredentialActions } from '../hooks/useCredentialActions';
import { CredentialDetails } from './CredentialDetails';
import { AccessList } from '../../../views/accessList/AccessList';
import { LoadingPage } from '../../../../../framework/components/LoadingPage';
import { AwxError } from '../../../common/AwxError';

export function CredentialPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const {
    data: credential,
    error,
    refresh,
  } = useGetItem<Credential>('/api/v2/credentials', params.id);
  const getPageUrl = useGetPageUrl();
  const pageNavigate = usePageNavigate();
  const actions = useCredentialActions({
    onDeleted: () => pageNavigate(AwxRoute.Credentials),
  });
  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!credential) return <LoadingPage breadcrumbs tabs />;
  return (
    <PageLayout>
      <PageHeader
        title={credential?.name}
        breadcrumbs={[
          { label: t('Credentials'), to: getPageUrl(AwxRoute.Credentials) },
          { label: credential?.name },
        ]}
        headerActions={
          <PageActions<Credential>
            actions={actions}
            position={DropdownPosition.right}
            selectedItem={credential}
          />
        }
      />
      <RoutedTabs isLoading={!credential} baseUrl={getPageUrl(AwxRoute.CredentialPage)}>
        <PageBackTab
          label={t('Back to Credentials')}
          url={getPageUrl(AwxRoute.Credentials)}
          persistentFilterKey="credentials"
        />
        <RoutedTab label={t('Details')} url={getPageUrl(AwxRoute.CredentialPage)}>
          <CredentialDetails credential={credential} />
        </RoutedTab>
        <RoutedTab label={t('Access')} url={RouteObj.CredentialAccess}>
          <AccessList sublistEndpoint={credential.related.access_list} />
        </RoutedTab>
      </RoutedTabs>
    </PageLayout>
  );
}
