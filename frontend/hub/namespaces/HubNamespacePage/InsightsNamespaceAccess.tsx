/**
 * InsightsNamespaceAccess - Access tab for namespaces in Insights/CRC mode
 *
 * This component wraps InsightsAccessTab with namespace-specific data fetching.
 * Unlike remotes and repositories which use Pulp RBAC endpoints, namespaces
 * have access data embedded directly on the namespace object.
 */
import { useParams } from 'react-router-dom';
import { LoadingPage } from '@ansible/ansible-ui-framework';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { hubAPI } from '../../common/api/formatPath';
import { HubError } from '../../common/HubError';
import { HubItemsResponse } from '../../common/useHubView';
import { HubNamespace } from '../HubNamespace';
import { InsightsAccessTab } from '../../common/InsightsAccessTab';

export function InsightsNamespaceAccess() {
  const params = useParams<{ id: string }>();
  const apiUrl = params.id ? hubAPI`/_ui/v1/namespaces/?limit=1&name=${params.id}` : undefined;
  const { data, error, refresh } = useGet<HubItemsResponse<HubNamespace>>(apiUrl);

  if (!data && !error) {
    return <LoadingPage />;
  }

  if (error) {
    return <HubError error={error} handleRefresh={refresh} />;
  }

  const namespace = data?.data?.[0];
  const users = namespace?.users || [];
  const groups = namespace?.groups || [];

  return <InsightsAccessTab users={users} groups={groups} resourceName={namespace?.name} />;
}
