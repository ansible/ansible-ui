import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { awxAPI } from '../../../common/api/awx-utils';
import { Team } from '../../../interfaces/Team';
import { AwxUser } from '../../../interfaces/User';
import { useRemoveUsersFromResource } from '../../common/useRemoveUserFromResource';
import { useSelectUsers } from './useSelectUsers';

export function useSelectAndRemoveUsersFromTeam(onClose?: (users: AwxUser[]) => void) {
  const { t } = useTranslation();
  const selectUsers = useSelectUsers();
  const removeUsersFromTeams = useRemoveUsersFromResource();

  const selectUsersRemoveTeams = useCallback(
    (team: Team) => {
      selectUsers(
        t('Remove users from team'),
        (users: AwxUser[]) => {
          removeUsersFromTeams(users, team, onClose);
        },
        t('Remove user(s)'),
        awxAPI`/teams/${team.id.toString()}/access_list/`
      );
    },
    [removeUsersFromTeams, onClose, selectUsers, t]
  );
  return selectUsersRemoveTeams;
}
