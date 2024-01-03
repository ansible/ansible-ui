import { ButtonVariant } from '@patternfly/react-core';
import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { EditIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
import { PageRoutedTabs } from '../../../../framework/PageTabs/PageRoutedTabs';
import { AwxError } from '../../../../frontend/awx/common/AwxError';
import { useGetItem } from '../../../../frontend/common/crud/useGet';
import { PlatformRoute } from '../../../PlatformRoutes';
import { gatewayAPI } from '../../../api/gateway-api-utils';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { useUserRowActions } from '../hooks/useUserActions';

export function PlatformUserPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { error, data: user, refresh } = useGetItem<PlatformUser>(gatewayAPI`/v1/users`, params.id);
  const getPageUrl = useGetPageUrl();
  const actions = useUserRowActions();
  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!user) return <LoadingPage breadcrumbs tabs />;
  return (
    <PageLayout>
      <PageHeader
        title={user.username}
        breadcrumbs={[
          { label: t('Users'), to: getPageUrl(PlatformRoute.Users) },
          { label: user.username },
        ]}
        headerActions={
          <PageActions<PlatformUser>
            actions={actions}
            position={DropdownPosition.right}
            selectedItem={user}
          />
        }
      />
      <PageRoutedTabs
        backTab={{
          label: t('Back to Users'),
          page: PlatformRoute.Users,
          persistentFilterKey: 'users',
        }}
        tabs={[
          { label: t('Details'), page: PlatformRoute.UserDetails },
          { label: t('Teams'), page: PlatformRoute.UserTeams },
          { label: t('Roles'), page: PlatformRoute.UserRoles },
          { label: t('Resource Access'), page: PlatformRoute.UserResourceAccess },
        ]}
        params={{ id: user.id }}
      />
    </PageLayout>
  );
}
