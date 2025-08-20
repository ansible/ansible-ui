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
import { pulpAPI } from '../../../common/api/formatPath';
import { HubError } from '../../../common/HubError';
import { Repository } from '../Repository';
import { HubRoute } from '../../../main/HubRoutes';
import { PulpItemsResponse } from '../../../common/useHubView';

export function RepositoryManageUsers() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const params = useParams<{
    id: string;
    resource_type: string;
    resource_id: string;
    user_id: string;
  }>();

  const { data, isLoading, error, refresh } = useGet<PulpItemsResponse<Repository>>(
    params.id ? pulpAPI`/repositories/ansible/ansible/?name=${params.id}` : ''
  );

  let repository: Repository | undefined = undefined;
  if (data?.results && data.results.length > 0) {
    repository = data.results[0];
  }
  const { data: users } = useGet<PlatformItemsResponse<PlatformUser>>(
    gatewayAPI`/users/?resource__ansible_id=${params.user_id ?? ''}`
  );

  if (error) {
    return <HubError error={error} handleRefresh={refresh} />;
  }
  if (!users || !repository || isLoading) {
    return <LoadingPage breadcrumbs tabs />;
  }

  const user = users?.results && users.results.length > 0 ? users?.results[0] : undefined;
  if (isLoading || !repository) return <LoadingPage />;

  return (
    <PageLayout>
      <PageHeader
        title={t(
          `Manage roles directly assigned to ${user?.username ?? ''} for ${repository?.name ?? ''}`
        )}
        breadcrumbs={[
          { label: t('Repositories'), to: getPageUrl(HubRoute.Repositories) },
          {
            label: repository?.name,
            to: getPageUrl(HubRoute.RepositoryDetails, { params: { name: repository?.name } }),
          },
          {
            label: t('User Access'),
            to: getPageUrl(HubRoute.RepositoryUserAccess, { params: { name: repository?.name } }),
          },
          { label: t(`Manage roles directly assigned to ${user?.username ?? ''}`) },
        ]}
      />
      <ManageResourceRoles resource={repository as unknown as ResourceType} user={user} />
    </PageLayout>
  );
}
