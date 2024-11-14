import {
  PageActions,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { LoadingPage } from '@ansible/ansible-ui-framework/components/LoadingPage';
import { AwxError } from '@ansible/awx-ui/common/AwxError';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useGetItem } from '../../../../frontend/common/crud/useGet';
import { Authenticator } from '../../../interfaces/Authenticator';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { useAuthenticatorPageActions } from '../hooks/useAuthenticatorActions';

import { PageRoutedTabs } from '../../../../frontend/common/PageRoutedTabs';
export function AuthenticatorPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const {
    error,
    data: authenticator,
    refresh,
  } = useGetItem<Authenticator>(`/api/gateway/v1/authenticators`, params.id);
  const getPageUrl = useGetPageUrl();
  const pageNavigate = usePageNavigate();
  const actions = useAuthenticatorPageActions(
    () => pageNavigate(PlatformRoute.Authenticators),
    refresh
  );

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!authenticator) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader
        title={authenticator.name}
        breadcrumbs={[
          { label: t('Authentication Methods'), to: getPageUrl(PlatformRoute.Authenticators) },
          { label: authenticator.name },
        ]}
        headerActions={
          <PageActions<Authenticator>
            actions={actions}
            position={'right'}
            selectedItem={authenticator}
          />
        }
      />
      <PageRoutedTabs
        backTab={{
          label: t('Back to Authentication Methods'),
          page: PlatformRoute.Authenticators,
          persistentFilterKey: 'name',
        }}
        tabs={[
          {
            label: t('Details'),
            dataCy: 'authenticator-detail-tab',
            page: PlatformRoute.AuthenticatorDetails,
          },
        ]}
        params={{
          id: authenticator?.id,
        }}
      />
    </PageLayout>
  );
}
