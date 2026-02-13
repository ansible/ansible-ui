/**
 * InsightsRemoteAccess - Access tab for remotes in Insights/CRC mode
 *
 * This component provides full access management functionality for remotes:
 * - Add/remove users and groups
 * - Add/remove roles for users and groups
 *
 * Uses the Pulp RBAC API endpoints (list_roles, add_role, remove_role).
 */
import { useTranslation } from 'react-i18next';
import { pulpAPI } from '../../../common/api/formatPath';
import { AnsibleRemoteRbacAPI } from '../../../common/api/pulp-rbac';
import { InsightsRbacAccessWrapper } from '../../../common/components/InsightsRbacAccessWrapper';

export function InsightsRemoteAccess() {
  const { t } = useTranslation();

  return (
    <InsightsRbacAccessWrapper
      getApiUrl={(id) => pulpAPI`/remotes/ansible/collection/?name=${id}`}
      rbacApi={AnsibleRemoteRbacAPI}
      missingIdError={t('Failed to get remote ID')}
      pulpObjectType="remotes/ansible/collection"
      selectRolesMessage={t('The selected roles will be added to this specific remote.')}
    />
  );
}
