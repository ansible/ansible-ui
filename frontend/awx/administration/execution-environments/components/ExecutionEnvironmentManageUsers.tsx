import { LoadingPage, PageHeader, PageLayout, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { gatewayAPI } from '@ansible/platform-ui/utils/gateway-api-utils';
import { PlatformUser } from '@ansible/platform-ui/interfaces/PlatformUser';
import { PlatformItemsResponse } from '@ansible/platform-ui/interfaces/PlatformItemsResponse';
import { awxAPI } from '../../../common/api/awx-utils';
import { AwxRoute } from '../../../main/AwxRoutes';
import {
  ManageResourceRoles,
  ResourceType,
} from '@ansible/common-ui/access/components/ManageResourceRoles';
import { ExecutionEnvironment } from '../../../interfaces/ExecutionEnvironment';

export function ExecutionEnvironmentManageUsers() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const params = useParams<{
    resource_type: string;
    resource_id: string;
    user_id: string;
  }>();

  const { data: executionEnvironment } = useGet<ExecutionEnvironment>(
    awxAPI`/execution_environments/${params.resource_id ?? ''}/`
  );
  const { data: users, isLoading } = useGet<PlatformItemsResponse<PlatformUser>>(
    gatewayAPI`/users/?resource__ansible_id=${params.user_id ?? ''}`
  );

  const user = users?.results && users.results.length > 0 ? users?.results[0] : undefined;
  if (isLoading || !executionEnvironment) return <LoadingPage />;

  return (
    <PageLayout>
      <PageHeader
        title={t(
          `Manage roles directly assigned to ${user?.username ?? ''} for ${executionEnvironment?.name ?? ''}`
        )}
        breadcrumbs={[
          { label: t('Inventories'), to: getPageUrl(AwxRoute.Inventories) },
          {
            label: executionEnvironment?.name,
            to: getPageUrl(AwxRoute.InstanceGroupDetails, {
              params: { id: executionEnvironment?.id },
            }),
          },
          {
            label: t('User Access'),
            to: getPageUrl(AwxRoute.InstanceGroupUserAccess, {
              params: { id: executionEnvironment?.id },
            }),
          },
          { label: t(`Manage roles directly assigned to ${user?.username ?? ''}`) },
        ]}
      />
      <ManageResourceRoles resource={executionEnvironment as unknown as ResourceType} user={user} />
    </PageLayout>
  );
}
