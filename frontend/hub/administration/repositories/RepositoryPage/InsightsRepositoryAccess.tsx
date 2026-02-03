/**
 * InsightsRepositoryAccess - Access tab for repositories in Insights/CRC mode
 */
import { pulpAPI } from '../../../common/api/formatPath';
import { AnsibleRepositoryRbacAPI } from '../../../common/api/pulp-rbac';
import { InsightsRbacAccessPage } from '../../../common/InsightsRbacAccessPage';
import { Repository } from '../Repository';

export function InsightsRepositoryAccess() {
  return (
    <InsightsRbacAccessPage<Repository>
      getApiUrl={(id) => pulpAPI`/repositories/ansible/ansible/?name=${id}`}
      rbacApi={AnsibleRepositoryRbacAPI}
      missingIdError="Failed to get repository ID"
    />
  );
}
