import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useBulkActionDialog } from '../../../../../framework/BulkActionDialog';
import { requestPost } from '../../../../common/crud/Data';
import { Team } from '../../../interfaces/Team';
import { User } from '../../../interfaces/User';

export function useAddTeamsToUsers() {
  const { t } = useTranslation();
  const teamProgressDialog = useBulkActionDialog<Team>();
  const addTeamsToUser = useCallback(
    (teams: Team[], users: User[], onComplete?: (teams: Team[]) => void) => {
      teamProgressDialog({
        title: t('Adding user to teams', { count: teams.length }),
        keyFn: (team: Team) => team.id,
        items: teams,
        actionColumns: [{ header: 'Team', cell: (team: Team) => team.name }],
        actionFn: async (team: Team, signal: AbortSignal) => {
          for (const user of users) {
            await requestPost(
              `/api/v2/users/${user.id.toString()}/roles/`,
              { id: team.summary_fields.object_roles.member_role.id },
              signal
            );
          }
        },
        processingText: t('Adding user to teams...', { count: teams.length }),
        onComplete,
      });
    },
    [teamProgressDialog, t]
  );
  return addTeamsToUser;
}
