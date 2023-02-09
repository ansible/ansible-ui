import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings, useBulkConfirmation } from '../../../../../framework';
import { requestPost } from '../../../../Data';
import { Team } from '../../../interfaces/Team';
import { User } from '../../../interfaces/User';
import { useUsersColumns } from '../../users/hooks/useUsersColumns';

export function useRemoveUsersFromTeam() {
  const { t } = useTranslation();

  const confirmationColumns = useUsersColumns();
  const removeUserConfirmationDialog = useBulkConfirmation<User>();

  const removeUserToTeams = useCallback(
    (users: User[], team: Team, onComplete?: (users: User[]) => void) => {
      removeUserConfirmationDialog({
        title: t('Remove user from team', { count: users.length }),
        confirmText: t('Yes, I confirm that I want to remove these {{count}} users.', {
          count: users.length,
        }),
        actionButtonText: t('Remove user', { count: users.length }),
        items: users.sort((l, r) => compareStrings(l.username, r.username)),
        keyFn: (user: User) => user.id,
        isDanger: true,
        confirmationColumns,
        actionColumns: [{ header: 'User', cell: (user: User) => user.username }],
        onComplete,
        actionFn: async (user: User, signal: AbortSignal) => {
          if (user.user_roles) {
            for (const role of user.user_roles) {
              await requestPost(
                `/api/v2/users/${user.id.toString()}/roles/`,
                { id: role.id, disassociate: true },
                signal
              );
            }
          } else {
            await requestPost(
              `/api/v2/users/${user.id.toString()}/roles/`,
              { id: team.summary_fields.object_roles.member_role.id, disassociate: true },
              signal
            );
          }
        },
      });
    },
    [confirmationColumns, removeUserConfirmationDialog, t]
  );
  return removeUserToTeams;
}
