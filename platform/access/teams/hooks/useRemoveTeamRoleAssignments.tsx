import { compareStrings, useBulkConfirmation } from '@ansible/ansible-ui-framework';
import { TeamAssignment } from '@ansible/common-ui/access/interfaces/TeamAssignment';
import { getItemKey, requestDelete } from '@ansible/common-ui/crud/Data';
import { useTranslation } from 'react-i18next';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { useTeamRolesColumns } from './useTeamRolesColumns';

export function useRemoveTeamRoleAssignments(onComplete: (assignments: TeamAssignment[]) => void) {
  const { t } = useTranslation();
  const actionColumns = useTeamRolesColumns();
  const bulkAction = useBulkConfirmation<TeamAssignment>();

  const removeAssignments = (assignments: TeamAssignment[]) =>
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
      actionFn: (assignment: TeamAssignment, signal) =>
        requestDelete(gatewayAPI`/role_team_assignments/${assignment.id.toString()}/`, signal),
    });

  return removeAssignments;
}
