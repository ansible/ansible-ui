/**
 * InsightsRemoteAccess - Access tab for remotes in Insights/CRC mode
 */
import { pulpAPI } from '../../../common/api/formatPath';
import { AnsibleRemoteRbacAPI } from '../../../common/api/pulp-rbac';
import { InsightsRbacAccessPage } from '../../../common/InsightsRbacAccessPage';
import { HubRemote } from '../Remotes';

export function InsightsRemoteAccess() {
  return (
    <InsightsRbacAccessPage<HubRemote>
      getApiUrl={(id) => pulpAPI`/remotes/ansible/collection/?name=${id}`}
      rbacApi={AnsibleRemoteRbacAPI}
      missingIdError="Failed to get remote ID"
    />
  );
}
