import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useBulkActionDialog } from '../../../../../framework/BulkActionDialog';
import { usePostRequest } from '../../../../common/crud/usePostRequest';
import { Team } from '../../../interfaces/Team';
import { User } from '../../../interfaces/User';

export function useAddTeamsToUsers() {
  const { t } = useTranslation();
  const teamProgressDialog = useBulkActionDialog<Team>();
  const postRequest = usePostRequest();
  const addTeamsToUser = useCallback(
    (teams: Team[], users: User[], onComplete?: (teams: Team[]) => void) => {
      teamProgressDialog({
        title: t('Adding user to teams', { count: teams.length }),
        keyFn: (team: Team) => team.id,
        items: teams,
        actionColumns: [{ header: 'Team', cell: (team: Team) => team.name }],
        actionFn: async (team: Team, signal: AbortSignal) => {
          for (const user of users) {
            await postRequest(
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
    [teamProgressDialog, t, postRequest]
  );
  return addTeamsToUser;
}
