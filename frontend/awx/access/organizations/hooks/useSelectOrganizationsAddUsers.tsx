import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Organization } from '../../../interfaces/Organization';
import { AwxUser } from '../../../interfaces/User';
import { useAddOrganizationsToUsers } from './useAddOrganizationsToUsers';
import { useSelectOrganizations } from './useSelectOrganizations';

export function useSelectOrganizationsAddUsers(onClose?: (organizations: Organization[]) => void) {
  const { t } = useTranslation();
  const selectOrganizations = useSelectOrganizations();
  const addOrganizationsToUsers = useAddOrganizationsToUsers();
  const selectOrganizationsAddUsers = useCallback(
    (users: AwxUser[]) => {
      selectOrganizations(
        t('Add users to organizations', { count: users.length }),
        (organizations: Organization[]) => {
          addOrganizationsToUsers(users, organizations, onClose);
        }
      );
    },
    [addOrganizationsToUsers, onClose, selectOrganizations, t]
  );
  return selectOrganizationsAddUsers;
}
