import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useBulkActionDialog } from '../../../../../framework/BulkActionDialog';
import { usePostRequest } from '../../../../common/crud/usePostRequest';
import { Organization } from '../../../interfaces/Organization';
import { User } from '../../../interfaces/User';

export function useAddUsersToOrganizations(onComplete?: (users: User[]) => void) {
  const { t } = useTranslation();
  const userProgressDialog = useBulkActionDialog<User>();
  const postRequest = usePostRequest();
  const addUserToOrganizations = useCallback(
    (users: User[], organizations: Organization[]) => {
      userProgressDialog({
        title: t('Adding users to organizations', {
          count: organizations.length,
        }),
        keyFn: (user: User) => user.id,
        items: users,
        actionColumns: [{ header: 'User', cell: (user: User) => user.username }],
        actionFn: async (user: User, signal: AbortSignal) => {
          for (const organization of organizations) {
            await postRequest(
              `/api/v2/users/${user.id.toString()}/roles/`,
              { id: organization.summary_fields.object_roles.member_role.id },
              signal
            );
          }
        },
        processingText: t('Adding users to organizations...', {
          count: organizations.length,
        }),
        onComplete,
      });
    },
    [userProgressDialog, t, onComplete, postRequest]
  );
  return addUserToOrganizations;
}
