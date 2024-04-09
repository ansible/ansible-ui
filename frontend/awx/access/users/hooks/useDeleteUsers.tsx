import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings, TextCell } from '../../../../../framework';
import { getItemKey, requestDelete } from '../../../../common/crud/Data';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxBulkConfirmation } from '../../../common/useAwxBulkConfirmation';
import { AwxUser } from '../../../interfaces/User';
import { useUsersColumns } from './useUsersColumns';

export function useDeleteUsers(onComplete: (users: AwxUser[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useUsersColumns({ disableLinks: true, disableSort: true });
  const deleteActionNameColumn = useMemo(
    () => ({
      header: t('Username'),
      cell: (user: AwxUser) => <TextCell text={user.username} />,
      sort: 'username',
      maxWidth: 200,
    }),
    [t]
  );
  const actionColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn]);
  const cannotDeleteUser = (user: AwxUser) => {
    return user?.summary_fields?.user_capabilities?.delete
      ? undefined
      : t('The user cannot be deleted due to insufficient permissions.');
  };
  const bulkAction = useAwxBulkConfirmation<AwxUser>();
  const deleteUsers = (users: AwxUser[]) => {
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
      actionFn: (user: AwxUser, signal) =>
        requestDelete(awxAPI`/users/${user.id.toString()}/`, signal),
    });
  };
  return deleteUsers;
}
