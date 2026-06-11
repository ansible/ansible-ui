import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Team } from '../../../interfaces/Team';
import { AwxUser } from '../../../interfaces/User';
import { useAssignTeamsToUsers } from './useAssignTeamsToUsers';
import { useSelectTeams } from './useSelectTeams';

export function useSelectTeamsAddUsers(onClose?: (teams: Team[]) => void) {
  const { t } = useTranslation();
  const selectTeams = useSelectTeams();
  const assignTeamsToUsers = useAssignTeamsToUsers();
  const selectTeamsAddUsers = useCallback(
    (users: AwxUser[]) => {
      selectTeams(t('Add users to teams', { count: users.length }), (teams: Team[]) => {
        assignTeamsToUsers(teams, users, onClose);
      });
    },
    [assignTeamsToUsers, onClose, selectTeams, t]
  );
  return selectTeamsAddUsers;
}
