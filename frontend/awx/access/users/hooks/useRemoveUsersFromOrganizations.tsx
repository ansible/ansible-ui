import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { usePostRequest } from '../../../../common/crud/usePostRequest';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxBulkActionDialog } from '../../../common/useAwxBulkActionDialog';
import { Organization } from '../../../interfaces/Organization';
import { User } from '../../../interfaces/User';

export function useRemoveUsersFromOrganizations(onComplete?: (users: User[]) => void) {
  const { t } = useTranslation();
  const userProgressDialog = useAwxBulkActionDialog<User>();
  const postRequest = usePostRequest();
  const removeUserToOrganizations = useCallback(
    (users: User[], organizations: Organization[]) => {
      userProgressDialog({
        title: t('Removing users from organizations', {
          count: organizations.length,
        }),
        keyFn: (user: User) => user.id,
        items: users,
        actionColumns: [{ header: t('User'), cell: (user: User) => user.username }],
        actionFn: async (user: User, signal: AbortSignal) => {
          for (const organization of organizations) {
            await postRequest(
              awxAPI`/users/${user.id.toString()}/roles/`,
              { id: organization.summary_fields.object_roles.member_role.id, disassociate: true },
              signal
            );
          }
        },
        processingText: t('Removing users from organizations...', {
          count: organizations.length,
        }),
        onComplete,
      });
    },
    [userProgressDialog, t, onComplete, postRequest]
  );
  return removeUserToOrganizations;
}
