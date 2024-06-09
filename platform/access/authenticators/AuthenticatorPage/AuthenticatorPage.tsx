import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  PageActions,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../framework';
import { LoadingPage } from '../../../../framework/components/LoadingPage';
import { AwxError } from '../../../../frontend/awx/common/AwxError';
import { useGetItem } from '../../../../frontend/common/crud/useGet';
import { Authenticator } from '../../../interfaces/Authenticator';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { PlatformAuthenticatorDetails } from './PlatformAuthenticatorDetails';
import { useAuthenticatorPageActions } from '../hooks/useAuthenticatorActions';

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
          { label: t('Authenticators'), to: getPageUrl(PlatformRoute.Authenticators) },
          { label: authenticator.name },
        ]}
        headerActions={
          <PageActions<Authenticator>
            actions={actions}
            position={DropdownPosition.right}
            selectedItem={authenticator}
          />
        }
      />
      <PlatformAuthenticatorDetails />
    </PageLayout>
  );
}
