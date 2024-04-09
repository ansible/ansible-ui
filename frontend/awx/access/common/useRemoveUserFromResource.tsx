import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings } from '../../../../framework';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { awxAPI } from '../../common/api/awx-utils';
import { useAwxActiveUser } from '../../common/useAwxActiveUser';
import { useAwxBulkConfirmation } from '../../common/useAwxBulkConfirmation';
import { AwxUser } from '../../interfaces/User';
import { useUsersColumns } from '../users/hooks/useUsersColumns';
import { ResourceType } from './ResourceAccessList';

export function useRemoveUsersFromResource() {
  const { t } = useTranslation();
  const { activeAwxUser } = useAwxActiveUser();
  const confirmationColumns = useUsersColumns();
  const removeUserConfirmationDialog = useAwxBulkConfirmation<AwxUser>();

  const postRequest = usePostRequest();

  const removeUsersFromResource = useCallback(
    (users: AwxUser[], resource: ResourceType, onComplete?: (users: AwxUser[]) => void) => {
      const canRemoveUsers: boolean =
        activeAwxUser?.is_superuser || resource?.summary_fields?.user_capabilities?.edit;
      const cannotRemoveUser = (user: AwxUser) => {
        if (user.is_superuser) {
          return t('System administrators have unrestricted access to all resources.');
        }
        if (user.is_system_auditor) {
          return t('System auditors have read access to all resources.');
        }
        if (!canRemoveUsers) {
          return t('The user cannot be deleted due to insufficient permissions.');
        }
        return undefined;
      };
      const undeletableUsers = users.filter(cannotRemoveUser);
      const titleMap: { [key: string]: string } = {
        organization: 'Remove user from organization',
        team: 'Remove user from team',
        // TODO: Expand map for other resource types
      };
      const title = resource.type ? titleMap[resource.type] : 'Remove user';

      removeUserConfirmationDialog({
        title: t(title, { count: users.length }),
        confirmText: t('Yes, I confirm that I want to remove these {{count}} users.', {
          count: users.length - undeletableUsers.length,
        }),
        actionButtonText: t('Remove user', { count: users.length }),
        items: users.sort((l, r) => compareStrings(l.username, r.username)),
        keyFn: (user: AwxUser) => user.id,
        alertPrompts:
          undeletableUsers.length > 0
            ? [
                t(
                  '{{count}} of the selected users cannot be deleted due to insufficient permissions.',
                  {
                    count: undeletableUsers.length,
                  }
                ),
              ]
            : undefined,
        isItemNonActionable: cannotRemoveUser,
        isDanger: true,
        confirmationColumns,
        actionColumns: [{ header: 'User', cell: (user: AwxUser) => user.username }],
        onComplete,
        actionFn: async (user: AwxUser, signal: AbortSignal) => {
          if (user.user_roles) {
            for (const role of user.user_roles) {
              await postRequest(
                awxAPI`/users/${user.id.toString()}/roles/`,
                {
                  id: role.id,
                  disassociate: true,
                },
                signal
              );
            }
          }
        },
      });
    },
    [activeAwxUser?.is_superuser, confirmationColumns, removeUserConfirmationDialog, postRequest, t]
  );
  return removeUsersFromResource;
}
