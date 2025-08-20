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

import { HubError } from '../../common/HubError';
import { HubNamespace } from '../HubNamespace';
import { HubRoute } from '../../main/HubRoutes';
import { hubAPI } from '../../common/api/formatPath';

export function HubNamespaceManageUsers() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const params = useParams<{
    id: string;
    resource_type: string;
    resource_id: string;
    user_id: string;
  }>();

  const {
    data: namespace,
    error,
    refresh,
    isLoading,
  } = useGet<HubNamespace>(hubAPI`/_ui/v1/namespaces/${params?.id}/`);

  const { data: users } = useGet<PlatformItemsResponse<PlatformUser>>(
    gatewayAPI`/users/?resource__ansible_id=${params.user_id ?? ''}`
  );
  if (error) {
    return <HubError error={error} handleRefresh={refresh} />;
  }
  if (!users || !namespace || isLoading) {
    return <LoadingPage breadcrumbs tabs />;
  }

  const user = users?.results && users.results.length > 0 ? users?.results[0] : undefined;
  if (isLoading || !namespace) return <LoadingPage />;

  return (
    <PageLayout>
      <PageHeader
        title={t(
          `Manage roles directly assigned to ${user?.username ?? ''} for ${namespace?.name ?? ''}`
        )}
        breadcrumbs={[
          { label: t('Namespaces'), to: getPageUrl(HubRoute.Namespaces) },
          {
            label: namespace?.name,
          },
          {
            label: t('User Access'),
          },
          { label: t(`Manage roles directly assigned to ${user?.username ?? ''}`) },
        ]}
      />
      <ManageResourceRoles resource={namespace as unknown as ResourceType} user={user} />
    </PageLayout>
  );
}
