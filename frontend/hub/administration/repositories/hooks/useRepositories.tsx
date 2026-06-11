import { useGet } from '@ansible/common-ui/crud/useGet';
import { hubAPI, pulpAPI } from '../../../common/api/formatPath';
import { isInsightsMode } from '../../../common/isInsights';
import { HubItemsResponse, PulpItemsResponse } from '../../../common/useHubView';
import { Repository } from '../Repository';

export interface PulpDistribution {
  pulp_href: string;
  pulp_created: string;
  base_path: string;
  name: string;
  repository: string | null;
  repository_version: string | null;
  content_guard: string | null;
  pulp_labels: Record<string, string>;
}

/**
 * Hook to fetch distributions/repositories.
 * - In Insights mode: uses the Pulp API because the UI API is blocked
 * - In Platform mode: uses the existing UI API for backwards compatibility
 */
export function useRepositories() {
  // In Insights mode, the UI API (/_ui/v1/distributions/) is blocked,
  // so we use the Pulp API instead
  const insightsUrl = pulpAPI`/distributions/ansible/ansible/`;
  const platformUrl = hubAPI`/_ui/v1/distributions/`;

  return useGet<HubItemsResponse<Repository> | PulpItemsResponse<PulpDistribution>>(
    isInsightsMode() ? insightsUrl : platformUrl
  );
}
