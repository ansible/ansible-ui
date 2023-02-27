import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Team } from '../../../interfaces/Team';
import { User } from '../../../interfaces/User';
import { useAddTeamsToUsers } from './useAddTeamsToUsers';
import { useSelectTeams } from './useSelectTeams';

export function useSelectTeamsAddUsers(onClose?: (teams: Team[]) => void) {
  const { t } = useTranslation();
  const selectTeams = useSelectTeams();
  const addTeamsToUsers = useAddTeamsToUsers();
  const selectTeamsAddUsers = useCallback(
    (users: User[]) => {
      selectTeams(t('Add users to teams', { count: users.length }), (teams: Team[]) => {
        addTeamsToUsers(teams, users, onClose);
      });
    },
    [addTeamsToUsers, onClose, selectTeams, t]
  );
  return selectTeamsAddUsers;
}
