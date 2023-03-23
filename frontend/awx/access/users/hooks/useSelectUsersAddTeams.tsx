import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { User } from '../../../interfaces/User';
import { ResourceType } from '../../common/ResourceAccessList';
import { useAddUsersToResources } from './useAddUsersToResources';
import { useSelectUsers } from './useSelectUsers';

export function useSelectUsersAddTeams(onClose?: (users: User[]) => void) {
  const { t } = useTranslation();
  const selectUsers = useSelectUsers();
  const addUsersToResources = useAddUsersToResources();
  const selectUsersAddTeams = useCallback(
    (teams: ResourceType[]) => {
      selectUsers(t('Add users to teams', { count: teams.length }), (users: User[]) => {
        addUsersToResources(users, teams, onClose);
      });
    },
    [addUsersToResources, onClose, selectUsers, t]
  );
  return selectUsersAddTeams;
}
