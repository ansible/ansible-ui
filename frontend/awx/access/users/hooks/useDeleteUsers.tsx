import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings, TextCell, useBulkConfirmation } from '../../../../../framework';
import { getItemKey, requestDelete } from '../../../../common/crud/Data';
import { User } from '../../../interfaces/User';
import { useUsersColumns } from './useUsersColumns';

export function useDeleteUsers(onComplete: (users: User[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useUsersColumns({ disableLinks: true, disableSort: true });
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
  const cannotDeleteUser = (user: User) => {
    return user?.summary_fields?.user_capabilities?.delete
      ? undefined
      : t('The user cannot be deleted due to insufficient permissions.');
  };
  const bulkAction = useBulkConfirmation<User>();
  const deleteUsers = (users: User[]) => {
    const undeletableUsers = users.filter(cannotDeleteUser);

    bulkAction({
      title: t('Permanently delete users', { count: users.length }),
      confirmText: t('Yes, I confirm that I want to delete these {{count}} users.', {
        count: undeletableUsers.length,
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
      actionFn: (user: User) => requestDelete(`/api/v2/users/${user.id}/`),
    });
  };
  return deleteUsers;
}
