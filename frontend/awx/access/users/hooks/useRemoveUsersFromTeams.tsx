import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { usePostRequest } from '../../../../common/crud/usePostRequest';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxBulkActionDialog } from '../../../common/useAwxBulkActionDialog';
import { Team } from '../../../interfaces/Team';
import { User } from '../../../interfaces/User';

export function useRemoveUsersFromTeams() {
  const { t } = useTranslation();
  const userProgressDialog = useAwxBulkActionDialog<User>();
  const postRequest = usePostRequest();
  const removeUserToTeams = useCallback(
    (users: User[], teams: Team[], onComplete?: (users: User[]) => void) => {
      userProgressDialog({
        title: t('Removing users from teams', {
          count: teams.length,
        }),
        keyFn: (user: User) => user.id,
        items: users,
        actionColumns: [{ header: t('User'), cell: (user: User) => user.username }],
        actionFn: async (user: User, signal: AbortSignal) => {
          for (const team of teams) {
            await postRequest(
              awxAPI`/users/${user.id.toString()}/roles/`,
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
    [userProgressDialog, t, postRequest]
  );
  return removeUserToTeams;
}
