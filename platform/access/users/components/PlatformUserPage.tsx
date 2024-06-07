import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  LoadingPage,
  PageActions,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../framework';
import { AwxError } from '../../../../frontend/awx/common/AwxError';
import { useGetItem } from '../../../../frontend/common/crud/useGet';
import { gatewayV1API } from '../../../api/gateway-api-utils';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { useUserRowActions } from '../hooks/useUserActions';
import { PageRoutedTabs } from '../../../../frontend/common/PageRoutedTabs';
import { usePlatformActiveUser } from '../../../main/PlatformActiveUserProvider';

export function PlatformUserPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { error, data: user, refresh } = useGetItem<PlatformUser>(gatewayV1API`/users/`, params.id);
  const getPageUrl = useGetPageUrl();
  const pageNavigate = usePageNavigate();
  const { activePlatformUser:activeUser } = usePlatformActiveUser();
  const actions = useUserRowActions(() => pageNavigate(PlatformRoute.Users));

  const pageTabs = [
    { label: t('Details'), page: PlatformRoute.UserDetails },
    { label: t('Teams'), page: PlatformRoute.UserTeams },
    { label: t('Roles'), page: PlatformRoute.UserRoles },
  ];

  // add tokens tab if the user from params(URL path) matches active user
  if (activeUser?.id !== undefined && activeUser?.id.toString() === params.id) {
    pageTabs.push({ label: t('Tokens'), page: PlatformRoute.UserTokens });
  }

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!user || !activeUser) return <LoadingPage breadcrumbs tabs />;

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
        tabs={pageTabs}
        params={{ id: user.id }}
      />
    </PageLayout>
  );
}
