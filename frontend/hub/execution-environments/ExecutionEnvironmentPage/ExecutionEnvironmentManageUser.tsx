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
import { hubAPI } from '../../common/api/formatPath';
import { HubError } from '../../common/HubError';
import { ExecutionEnvironment } from '../ExecutionEnvironment';
import { HubRoute } from '../../main/HubRoutes';

export function ExecutionEnvironmentManageUsers() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const params = useParams<{
    id: string;
    resource_type: string;
    resource_id: string;
    user_id: string;
  }>();

  const {
    data: executionEnvironment,
    error,
    refresh,
    isLoading,
  } = useGet<ExecutionEnvironment>(
    params?.resource_id
      ? hubAPI`/v3/plugin/execution-environments/repositories/${params?.id}/`
      : undefined
  );

  const { data: users } = useGet<PlatformItemsResponse<PlatformUser>>(
    gatewayAPI`/users/?resource__ansible_id=${params.user_id ?? ''}`
  );
  if (error) {
    return <HubError error={error} handleRefresh={refresh} />;
  }
  if (!users || !executionEnvironment || isLoading) {
    return <LoadingPage breadcrumbs tabs />;
  }

  const user = users?.results && users.results.length > 0 ? users?.results[0] : undefined;
  if (isLoading || !executionEnvironment) return <LoadingPage />;

  return (
    <PageLayout>
      <PageHeader
        title={t(
          `Manage roles directly assigned to ${user?.username ?? ''} for ${executionEnvironment?.name ?? ''}`
        )}
        breadcrumbs={[
          { label: t('Execution environments'), to: getPageUrl(HubRoute.ExecutionEnvironments) },
          {
            label: executionEnvironment?.name,
          },
          {
            label: t('User Access'),
          },
          { label: t(`Manage roles directly assigned to ${user?.username ?? ''}`) },
        ]}
      />
      <ManageResourceRoles resource={executionEnvironment as unknown as ResourceType} user={user} />
    </PageLayout>
  );
}
