import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { usePostRequest } from '../../../../common/crud/usePostRequest';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxBulkActionDialog } from '../../../common/useAwxBulkActionDialog';
import { Team } from '../../../interfaces/Team';
import { AwxUser } from '../../../interfaces/User';

export function useRemoveTeamsFromUsers(onComplete?: (team: Team[]) => void) {
  const { t } = useTranslation();
  const bulkProgressDialog = useAwxBulkActionDialog<Team>();
  const postRequest = usePostRequest();
  const removeUserToTeams = useCallback(
    (users: AwxUser[], teams: Team[]) => {
      bulkProgressDialog({
        title: t('Removing user from teams', {
          count: teams.length,
        }),
        keyFn: (team: Team) => team.id,
        items: teams,
        actionColumns: [{ header: t('Team'), cell: (team: Team) => team.name }],
        actionFn: async (team: Team, signal: AbortSignal) => {
          for (const user of users) {
            await postRequest(
              awxAPI`/users/${user.id.toString()}/roles/`,
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
    [bulkProgressDialog, t, onComplete, postRequest]
  );
  return removeUserToTeams;
}
