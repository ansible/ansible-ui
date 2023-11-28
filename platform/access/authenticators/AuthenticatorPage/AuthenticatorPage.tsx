import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { EditIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  PageActions,
  PageHeader,
  PageLayout,
  useGetPageUrl,
} from '../../../../framework';
import { LoadingPage } from '../../../../framework/components/LoadingPage';
import { useGetItem } from '../../../../frontend/common/crud/useGet';
import { AwxError } from '../../../../frontend/awx/common/AwxError';
import { Authenticator } from '../../../interfaces/Authenticator';
import { PlatformRoute } from '../../../PlatformRoutes';
import { AuthenticatorDetails } from './AuthenticatorDetails';

export function AuthenticatorPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const {
    error,
    data: authenticator,
    refresh,
  } = useGetItem<Authenticator>(`/api/gateway/v1/authenticators`, params.id);

  const getPageUrl = useGetPageUrl();

  const itemActions: IPageAction<Authenticator>[] = useMemo(() => {
    const itemActions: IPageAction<Authenticator>[] = [
      {
        type: PageActionType.Link,
        selection: PageActionSelection.Single,
        // variant: ButtonVariant.primary,
        isPinned: true,
        icon: EditIcon,
        label: t('Edit authenticator'),
        href: () => getPageUrl(PlatformRoute.EditAuthenticator, { params: { id: params.id } }),
      },
    ];
    return itemActions;
  }, [t, getPageUrl, params.id]);

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
            actions={itemActions}
            position={DropdownPosition.right}
            selectedItem={authenticator}
          />
        }
      />
      <AuthenticatorDetails />
    </PageLayout>
  );
}
