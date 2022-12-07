import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useBulkActionDialog } from '../../../../../framework/BulkActionDialog';
import { requestPost } from '../../../../Data';
import { Team } from '../../../interfaces/Team';
import { User } from '../../../interfaces/User';

export function useRemoveUsersFromTeams() {
  const { t } = useTranslation();
  const userProgressDialog = useBulkActionDialog<User>();
  const removeUserToTeams = useCallback(
    (users: User[], teams: Team[], onComplete?: (users: User[]) => void) => {
      userProgressDialog({
        title: t('Removing users from teams', {
          count: teams.length,
        }),
        keyFn: (user: User) => user.id,
        items: users,
        actionColumns: [{ header: 'User', cell: (user: User) => user.username }],
        actionFn: async (user: User, signal: AbortSignal) => {
          for (const team of teams) {
            await requestPost(
              `/api/v2/users/${user.id.toString()}/roles/`,
              { id: team.summary_fields.object_roles.member_role.id, disassociate: true },
              signal
            );
          }
        },
        processingText: t('Removing users from teams...', {
          count: teams.length,
        }),
        onComplete,
      });
    },
    [userProgressDialog, t]
  );
  return removeUserToTeams;
}
