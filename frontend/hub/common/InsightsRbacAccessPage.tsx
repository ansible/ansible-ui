/**
 * InsightsRbacAccessPage - Shared access page component for Pulp resources in Insights mode
 *
 * This component combines useInsightsRbacAccess hook with loading/error states
 * and the InsightsAccessTab presentation component.
 *
 * Used by InsightsRemoteAccess and InsightsRepositoryAccess.
 */
import { LoadingPage } from '@ansible/ansible-ui-framework';
import { useParams } from 'react-router-dom';
import { PulpRbacApi } from './api/pulp-rbac';
import { HubError } from './HubError';
import { InsightsAccessTab } from './InsightsAccessTab';
import { useInsightsRbacAccess } from './useInsightsRbacAccess';

interface PulpResource {
  pulp_href?: string;
  name?: string;
}

interface InsightsRbacAccessPageProps {
  /** Function that takes the resource name/id and returns the API URL */
  getApiUrl: (id: string) => string;
  /** The RBAC API instance to use */
  rbacApi: PulpRbacApi;
  /** Error message to show when Pulp ID cannot be parsed */
  missingIdError: string;
}

/**
 * Shared access page component for Pulp resources that use RBAC
 */
export function InsightsRbacAccessPage<T extends PulpResource>({
  getApiUrl,
  rbacApi,
  missingIdError,
}: InsightsRbacAccessPageProps) {
  const params = useParams<{ id: string }>();
  const apiUrl = params.id ? getApiUrl(params.id) : '';

  const {
    users,
    groups,
    resourceName,
    resourceError,
    rbacError,
    resourceLoading,
    rbacLoading,
    pulpId,
    refresh,
  } = useInsightsRbacAccess<T>({ apiUrl, rbacApi });

  if (resourceLoading) {
    return <LoadingPage />;
  }

  if (resourceError) {
    return <HubError error={resourceError} handleRefresh={refresh} />;
  }

  if (!pulpId) {
    return <HubError error={new Error(missingIdError)} handleRefresh={refresh} />;
  }

  if (rbacLoading) {
    return <LoadingPage />;
  }

  if (rbacError) {
    return <HubError error={rbacError} handleRefresh={refresh} />;
  }

  return <InsightsAccessTab users={users} groups={groups} resourceName={resourceName} />;
}
