import { useParams } from 'react-router-dom';
import {
  IPageAction,
  LoadingPage,
  PageActionSelection,
  PageActionType,
  PageActions,
  PageHeader,
  PageLayout,
  useGetPageUrl,
} from '../../../../framework';
import { useGetItem } from '../../../../frontend/common/crud/useGet';
import { Authenticator } from '../../../interfaces/Authenticator';
import { PlatformRoute } from '../../../PlatformRoutes';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { ButtonVariant } from '@patternfly/react-core';
import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { EditIcon, TrashIcon } from '@patternfly/react-icons';
import { AwxError } from '../../../../frontend/awx/common/AwxError';
import { PageRoutedTabs } from '../../../../framework/PageTabs/PageRoutedTabs';
import { gatewayAPI } from '../../../api/gateway-api-utils';

export function AuthenticatorPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const {
    error,
    data: authenticator,
    refresh,
  } = useGetItem<Authenticator>(gatewayAPI`/v1/authenticators`, params.id);
  const getPageUrl = useGetPageUrl();

  const itemActions: IPageAction<Authenticator>[] = useMemo(() => {
    const itemActions: IPageAction<Authenticator>[] = [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: EditIcon,
        label: t('Edit authenticator'),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        onClick: (authenticator) => alert('TODO'),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete authenticator'),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        onClick: (authenticator) => alert('TODO'),
        isDanger: true,
      },
    ];
    return itemActions;
  }, [t]);

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!authenticator) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader
        title={authenticator?.name}
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
      <PageRoutedTabs
        backTab={{
          label: t('Back to Authenticators'),
          page: PlatformRoute.Authenticators,
          persistentFilterKey: 'authenticators',
        }}
        tabs={[{ label: t('Details'), page: PlatformRoute.AuthenticatorDetails }]}
        params={{ id: authenticator.id }}
      />
    </PageLayout>
  );
}
