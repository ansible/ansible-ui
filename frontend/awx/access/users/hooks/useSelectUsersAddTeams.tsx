import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AwxUser } from '../../../interfaces/User';
import { type ResourceType } from '../../common/types';
import { useAddUsersToResources } from './useAddUsersToResources';
import { useSelectUsers } from './useSelectUsers';

export function useSelectUsersAddTeams(onClose?: (users: AwxUser[]) => void) {
  const { t } = useTranslation();
  const selectUsers = useSelectUsers();
  const addUsersToResources = useAddUsersToResources();
  const selectUsersAddTeams = useCallback(
    (teams: ResourceType[]) => {
      selectUsers(t('Add users to teams', { count: teams.length }), (users: AwxUser[]) => {
        addUsersToResources(users, teams, onClose);
      });
    },
    [addUsersToResources, onClose, selectUsers, t]
  );
  return selectUsersAddTeams;
}
