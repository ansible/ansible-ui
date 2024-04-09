import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { usePostRequest } from '../../../../common/crud/usePostRequest';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxBulkActionDialog } from '../../../common/useAwxBulkActionDialog';
import { Team } from '../../../interfaces/Team';
import { AwxUser } from '../../../interfaces/User';

export function useAddTeamsToUsers() {
  const { t } = useTranslation();
  const teamProgressDialog = useAwxBulkActionDialog<Team>();
  const postRequest = usePostRequest();
  const addTeamsToUser = useCallback(
    (teams: Team[], users: AwxUser[], onComplete?: (teams: Team[]) => void) => {
      teamProgressDialog({
        title: t('Adding user to teams', { count: teams.length }),
        keyFn: (team: Team) => team.id,
        items: teams,
        actionColumns: [{ header: t('Team'), cell: (team: Team) => team.name }],
        actionFn: async (team: Team, signal: AbortSignal) => {
          for (const user of users) {
            await postRequest(
              awxAPI`/users/${user.id.toString()}/roles/`,
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
