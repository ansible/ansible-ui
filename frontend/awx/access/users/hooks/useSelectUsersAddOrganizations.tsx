import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Organization } from '../../../interfaces/Organization';
import { User } from '../../../interfaces/User';
import { useAddUsersToResources } from './useAddUsersToResources';
import { useSelectUsers } from './useSelectUsers';

export function useSelectUsersAddOrganizations() {
  const { t } = useTranslation();
  const selectUsers = useSelectUsers();
  const addUsersToResources = useAddUsersToResources();
  const selectUsersAddOrganizations = useCallback(
    (organizations: Organization[]) => {
      selectUsers(
        t('Add users to organizations', { count: organizations.length }),
        (users: User[]) => {
          addUsersToResources(users, organizations);
        }
      );
    },
    [addUsersToResources, selectUsers, t]
  );
  return selectUsersAddOrganizations;
}
