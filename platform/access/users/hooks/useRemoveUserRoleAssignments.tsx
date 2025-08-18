import { compareStrings, useBulkConfirmation } from '@ansible/ansible-ui-framework';
import { getItemKey, requestDelete } from '@ansible/common-ui/crud/Data';
import { useTranslation } from 'react-i18next';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { usePlatformUserRolesColumns } from './usePlatformUserRolesColumns';
import { UserAssignment } from '@ansible/common-ui/access/interfaces/UserAssignment';

export function useRemoveUserRoleAssignments(onComplete: (assignments: UserAssignment[]) => void) {
  const { t } = useTranslation();
  const actionColumns = usePlatformUserRolesColumns();
  const bulkAction = useBulkConfirmation<UserAssignment>();

  const removeAssignments = (assignments: UserAssignment[]) =>
    bulkAction({
      title: t('Remove role', { count: assignments.length }),
      confirmText: t('Yes, I confirm that I want to remove these {{count}} roles.', {
        count: assignments.length,
      }),
      actionButtonText: t('Remove role', { count: assignments.length }),
      items: [...assignments].sort((l, r) =>
        compareStrings(l.summary_fields.role_definition.name, r.summary_fields.role_definition.name)
      ),
      keyFn: getItemKey,
      isDanger: true,
      confirmationColumns: actionColumns,
      actionColumns,
      onComplete,
      actionFn: (assignment: UserAssignment, signal) =>
        requestDelete(gatewayAPI`/role_user_assignments/${assignment.id.toString()}/`, signal),
    });

  return removeAssignments;
}
