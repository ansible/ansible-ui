import { LoadingPage } from '@ansible/ansible-ui-framework';
import { ResourceUserAccess } from '@ansible/common-ui/access/components/ResourceUserAccess';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { useParams } from 'react-router';
import { hubAPI } from '../../common/api/formatPath';
import { HubError } from '../../common/HubError';
import { HubItemsResponse } from '../../common/useHubView';
import { HubRoute } from '../../main/HubRoutes';
import { HubNamespace } from '../HubNamespace';

export function HubNamespaceUserAccess() {
  const params = useParams<{ id: string }>();
  const { data, error, refresh } = useGet<HubItemsResponse<HubNamespace>>(
    hubAPI`/_ui/v1/namespaces/?limit=1&name=${params.id}`
  );

  let namespace: HubNamespace | undefined = undefined;
  if (data && data.data && data.data.length > 0) {
    namespace = data.data[0];
  }

  if (!data && !error) {
    return <LoadingPage />;
  }

  if (error) {
    return <HubError error={error} handleRefresh={refresh} />;
  }

  return (
    <ResourceUserAccess
      service="hub"
      id={namespace?.id.toString() || ''}
      type={'galaxy.namespace'}
      addRolesRoute={HubRoute.NamespaceAddUsers}
      manageRoleRoute={HubRoute.NamespaceManageUsers}
    />
  );
}
