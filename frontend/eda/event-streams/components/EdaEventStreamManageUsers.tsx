import { LoadingPage, PageHeader, PageLayout, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { edaAPI } from '../../common/eda-utils';
import { EdaEventStream } from '../../interfaces/EdaEventStream';
import { EdaRoute } from '../../main/EdaRoutes';
import { gatewayAPI } from '@ansible/platform-ui/utils/gateway-api-utils';
import {
  ManageResourceRoles,
  ResourceType,
} from '@ansible/common-ui/access/components/ManageResourceRoles';
import { PlatformUser } from '@ansible/platform-ui/interfaces/PlatformUser';
import { PlatformItemsResponse } from '@ansible/platform-ui/interfaces/PlatformItemsResponse';

export function EdaEventStreamManageUsers() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const params = useParams<{
    resource_type: string;
    resource_id: string;
    user_id: string;
  }>();

  const { data: eventStream } = useGet<EdaEventStream>(
    edaAPI`/event-streams/${params.resource_id ?? ''}/`
  );
  const { data: users, isLoading } = useGet<PlatformItemsResponse<PlatformUser>>(
    gatewayAPI`/users/?resource__ansible_id=${params.user_id ?? ''}`
  );

  const user = users?.results && users.results.length > 0 ? users?.results[0] : undefined;
  if (isLoading || !eventStream) return <LoadingPage />;

  return (
    <PageLayout>
      <PageHeader
        title={t(
          `Manage roles directly assigned to ${user?.username ?? ''} for ${eventStream?.name ?? ''}`
        )}
        breadcrumbs={[
          { label: t('EventStreams'), to: getPageUrl(EdaRoute.EventStreams) },
          {
            label: eventStream?.name,
            to: getPageUrl(EdaRoute.EventStreamDetails, { params: { id: eventStream?.id } }),
          },
          {
            label: t('User Access'),
            to: getPageUrl(EdaRoute.EventStreamUserAccess, { params: { id: eventStream?.id } }),
          },
          { label: t(`Manage roles directly assigned to ${user?.username ?? ''}`) },
        ]}
      />
      <ManageResourceRoles resource={eventStream as unknown as ResourceType} user={user} />
    </PageLayout>
  );
}
