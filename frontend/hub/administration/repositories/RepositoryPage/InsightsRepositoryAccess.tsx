/**
 * InsightsRepositoryAccess - Access tab for repositories in Insights/CRC mode
 *
 * This component provides full access management functionality for repositories:
 * - Add/remove users and groups
 * - Add/remove roles for users and groups
 *
 * Uses the Pulp RBAC API endpoints (list_roles, add_role, remove_role).
 */
import { useTranslation } from 'react-i18next';
import { pulpAPI } from '../../../common/api/formatPath';
import { AnsibleRepositoryRbacAPI } from '../../../common/api/pulp-rbac';
import { InsightsRbacAccessWrapper } from '../../../common/components/InsightsRbacAccessWrapper';

export function InsightsRepositoryAccess() {
  const { t } = useTranslation();

  return (
    <InsightsRbacAccessWrapper
      getApiUrl={(id) => pulpAPI`/repositories/ansible/ansible/?name=${id}`}
      rbacApi={AnsibleRepositoryRbacAPI}
      missingIdError={t('Failed to get repository ID')}
      pulpObjectType="repositories/ansible/ansible"
      selectRolesMessage={t('The selected roles will be added to this specific repository.')}
    />
  );
}
