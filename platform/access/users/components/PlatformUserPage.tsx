import {
  LoadingPage,
  PageActions,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { AwxError } from '@ansible/awx-ui/common/AwxError';
import { useGetItem } from '@ansible/common-ui/crud/useGet';
import { PageRoutedTabs } from '@ansible/common-ui/PageRoutedTabs';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { usePlatformActiveUser } from '../../../main/PlatformActiveUserProvider';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { useUserPageActions } from '../hooks/useUserActions';

export function PlatformUserPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { error, data: user, refresh } = useGetItem<PlatformUser>(gatewayAPI`/users/`, params.id);
  const getPageUrl = useGetPageUrl();
  const pageNavigate = usePageNavigate();
  const { activePlatformUser: activeUser } = usePlatformActiveUser();
  const actions = useUserPageActions(() => pageNavigate(PlatformRoute.Users));

  const pageTabs = [
    { label: t('Details'), page: PlatformRoute.UserDetails },
    { label: t('Teams'), page: PlatformRoute.UserTeams },
    { label: t('Roles'), page: PlatformRoute.UserRoles },
  ];

  // add tokens tab if the user from params(URL path) matches active user
  if (activeUser?.id !== undefined && activeUser?.id.toString() === params.id) {
    pageTabs.push({ label: t('Tokens'), page: PlatformRoute.AAPUserTokens });
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
          <PageActions<PlatformUser> actions={actions} position={'right'} selectedItem={user} />
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
