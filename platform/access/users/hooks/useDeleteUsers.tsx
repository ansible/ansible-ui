import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TextCell, compareStrings, useBulkConfirmation } from '../../../../framework';
import { getItemKey, requestDelete } from '../../../../frontend/common/crud/Data';
import { gatewayV1API } from '../../../api/gateway-api-utils';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { useUsersColumns } from './useUserColumns';

export function useDeleteUsers(onComplete: (users: PlatformUser[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useUsersColumns();
  const deleteActionNameColumn = useMemo(
    () => ({
      header: t('Username'),
      cell: (user: PlatformUser) => <TextCell text={user.username} />,
      sort: 'username',
      maxWidth: 200,
    }),
    [t]
  );
  const actionColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn]);
  // TODO: Update based on RBAC information from Users API
  const cannotDeleteUser = (user: PlatformUser) => {
    if (user.managed) {
      return t(`System managed users cannot be deleted`);
    }
    return '';
  };
  const bulkAction = useBulkConfirmation<PlatformUser>();
  const deleteUsers = (users: PlatformUser[]) => {
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
      actionFn: (user: PlatformUser, signal) =>
        requestDelete(gatewayV1API`/users/${user.id.toString()}/`, signal),
    });
  };
  return deleteUsers;
}
