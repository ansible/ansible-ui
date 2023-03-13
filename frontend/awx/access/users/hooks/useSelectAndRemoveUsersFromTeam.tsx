import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Team } from '../../../interfaces/Team';
import { User } from '../../../interfaces/User';
import { useRemoveUsersFromResource } from '../../common/useRemoveUserFromResource';
import { useSelectUsers } from './useSelectUsers';

export function useSelectAndRemoveUsersFromTeam(onClose?: (users: User[]) => void) {
  const { t } = useTranslation();
  const selectUsers = useSelectUsers();
  const removeUsersFromTeams = useRemoveUsersFromResource();

  const selectUsersRemoveTeams = useCallback(
    (team: Team) => {
      selectUsers(
        t('Remove users from team'),
        (users: User[]) => {
          removeUsersFromTeams(users, team, onClose);
        },
        t('Remove user(s)'),
        `/api/v2/teams/${team.id}/access_list/`
      );
    },
    [removeUsersFromTeams, onClose, selectUsers, t]
  );
  return selectUsersRemoveTeams;
}
