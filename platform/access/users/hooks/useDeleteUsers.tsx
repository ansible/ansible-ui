import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { User } from '../../../interfaces/User';
import { TextCell, compareStrings, useBulkConfirmation } from '../../../../framework';
import { getItemKey, requestDelete } from '../../../../frontend/common/crud/Data';
import { useUsersColumns } from './useUserColumns';
import { gatewayAPI } from '../../../api/gateway-api-utils';

export function useDeleteUsers(onComplete: (users: User[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useUsersColumns();
  const deleteActionNameColumn = useMemo(
    () => ({
      header: t('Username'),
      cell: (user: User) => <TextCell text={user.username} />,
      sort: 'username',
      maxWidth: 200,
    }),
    [t]
  );
  const actionColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn]);
  // TODO: Update based on RBAC information from Users API
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const cannotDeleteUser = (user: User) => {
    // eslint-disable-next-line no-constant-condition
    return true //user?.summary_fields?.user_capabilities?.delete
      ? undefined
      : t('The user cannot be deleted due to insufficient permissions.');
  };
  const bulkAction = useBulkConfirmation<User>();
  const deleteUsers = (users: User[]) => {
    const undeletableUsers = users.filter(cannotDeleteUser);

    bulkAction({
      title: t('Permanently delete users', { count: users.length }),
      confirmText: t('Yes, I confirm that I want to delete these {{count}} users.', {
        count: users.length - undeletableUsers.length,
      }),
      actionButtonText: t('Delete users', { count: users.length }),
      items: users.sort((l, r) => compareStrings(l.username, r.username)),
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
      isItemNonActionable: cannotDeleteUser,
      keyFn: getItemKey,
      isDanger: true,
      confirmationColumns,
      actionColumns,
      onComplete,
      actionFn: (user: User, signal) =>
        requestDelete(gatewayAPI`/v1/users/${user.id.toString()}/`, signal),
    });
  };
  return deleteUsers;
}
