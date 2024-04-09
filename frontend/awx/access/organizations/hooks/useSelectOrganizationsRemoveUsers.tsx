import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Organization } from '../../../interfaces/Organization';
import { AwxUser } from '../../../interfaces/User';
import { useRemoveOrganizationsFromUsers } from './useRemoveOrganizationsFromUsers';
import { useSelectOrganizations } from './useSelectOrganizations';

export function useSelectOrganizationsRemoveUsers(
  onClose?: (organizatinos: Organization[]) => void
) {
  const { t } = useTranslation();
  const selectOrganizations = useSelectOrganizations();
  const removeOrganizationsFromUsers = useRemoveOrganizationsFromUsers();
  const selectOrganizationsRemoveUsers = useCallback(
    (users: AwxUser[]) => {
      selectOrganizations(
        t('Remove users from organizations', { count: users.length }),
        (organizations: Organization[]) => {
          removeOrganizationsFromUsers(users, organizations, onClose);
        }
      );
    },
    [selectOrganizations, t, removeOrganizationsFromUsers, onClose]
  );
  return selectOrganizationsRemoveUsers;
}
