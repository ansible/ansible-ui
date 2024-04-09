import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Team } from '../../../interfaces/Team';
import { AwxUser } from '../../../interfaces/User';
import { useRemoveUsersFromTeams } from './useRemoveUsersFromTeams';
import { useSelectUsers } from './useSelectUsers';

export function useSelectUsersRemoveTeams(onClose?: (users: AwxUser[]) => void) {
  const { t } = useTranslation();
  const selectUsers = useSelectUsers();
  const removeUsersFromTeams = useRemoveUsersFromTeams();
  const selectUsersRemoveTeams = useCallback(
    (teams: Team[]) => {
      selectUsers(
        t('Remove users from teams', { count: teams.length }),
        (users: AwxUser[]) => {
          removeUsersFromTeams(users, teams, onClose);
        },
        t('Remove user(s)')
      );
    },
    [removeUsersFromTeams, onClose, selectUsers, t]
  );
  return selectUsersRemoveTeams;
}
