import { LoadingPage, PageHeader, PageLayout, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { gatewayAPI } from '@ansible/platform-ui/utils/gateway-api-utils';
import { PlatformUser } from '@ansible/platform-ui/interfaces/PlatformUser';
import { PlatformItemsResponse } from '@ansible/platform-ui/interfaces/PlatformItemsResponse';
import {
  ManageResourceRoles,
  ResourceType,
} from '@ansible/common-ui/access/components/ManageResourceRoles';
import { HubRemote } from '../Remotes';
import { pulpAPI } from '../../../common/api/formatPath';
import { HubRoute } from '../../../main/HubRoutes';
import { HubError } from '../../../common/HubError';

export function RemoteManageUsers() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const params = useParams<{
    resource_type: string;
    resource_id: string;
    user_id: string;
  }>();

  const {
    data: remote,
    error,
    refresh,
    isLoading,
  } = useGet<HubRemote>(
    params?.resource_id ? pulpAPI`/remotes/ansible/collection/${params?.resource_id}/` : undefined
  );

  const { data: users } = useGet<PlatformItemsResponse<PlatformUser>>(
    gatewayAPI`/users/?resource__ansible_id=${params.user_id ?? ''}`
  );
  if (error) {
    return <HubError error={error} handleRefresh={refresh} />;
  }
  if (!users || !remote || isLoading) {
    return <LoadingPage breadcrumbs tabs />;
  }

  const user = users?.results && users.results.length > 0 ? users?.results[0] : undefined;
  if (isLoading || !remote) return <LoadingPage />;

  return (
    <PageLayout>
      <PageHeader
        title={t(
          `Manage roles directly assigned to ${user?.username ?? ''} for ${remote?.name ?? ''}`
        )}
        breadcrumbs={[
          { label: t('Remotes'), to: getPageUrl(HubRoute.Remotes) },
          {
            label: remote?.name,
          },
          {
            label: t('User Access'),
          },
          { label: t(`Manage roles directly assigned to ${user?.username ?? ''}`) },
        ]}
      />
      <ManageResourceRoles resource={remote as unknown as ResourceType} user={user} />
    </PageLayout>
  );
}
