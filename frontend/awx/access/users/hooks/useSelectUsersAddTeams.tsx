import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Team } from '../../../interfaces/Team';
import { User } from '../../../interfaces/User';
import { useAddUsersToTeams } from './useAddUsersToTeams';
import { useSelectUsers } from './useSelectUsers';

export function useSelectUsersAddTeams(onClose?: (users: User[]) => void) {
  const { t } = useTranslation();
  const selectUsers = useSelectUsers();
  const addUsersToTeams = useAddUsersToTeams();
  const selectUsersAddTeams = useCallback(
    (teams: Team[]) => {
      selectUsers(t('Add users to teams', { count: teams.length }), (users: User[]) => {
        addUsersToTeams(users, teams, onClose);
      });
    },
    [addUsersToTeams, onClose, selectUsers, t]
  );
  return selectUsersAddTeams;
}
