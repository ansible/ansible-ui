import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useBulkActionDialog } from '../../../../../framework/BulkActionDialog';
import { requestPost } from '../../../../common/crud/Data';
import { Team } from '../../../interfaces/Team';
import { User } from '../../../interfaces/User';

export function useRemoveTeamsFromUsers(onComplete?: (team: Team[]) => void) {
  const { t } = useTranslation();
  const bulkProgressDialog = useBulkActionDialog<Team>();
  const removeUserToTeams = useCallback(
    (users: User[], teams: Team[]) => {
      bulkProgressDialog({
        title: t('Removing user from teams', {
          count: teams.length,
        }),
        keyFn: (team: Team) => team.id,
        items: teams,
        actionColumns: [{ header: 'Team', cell: (team: Team) => team.name }],
        actionFn: async (team: Team, signal: AbortSignal) => {
          for (const user of users) {
            await requestPost(
              `/api/v2/users/${user.id.toString()}/roles/`,
              { id: team.summary_fields.object_roles.member_role.id, disassociate: true },
              signal
            );
          }
        },
        processingText: t('Removing user from teams...', {
          count: teams.length,
        }),
        onComplete,
      });
    },
    [onComplete, bulkProgressDialog, t]
  );
  return removeUserToTeams;
}
