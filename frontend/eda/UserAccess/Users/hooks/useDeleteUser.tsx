import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings, useBulkConfirmation } from '../../../../../framework';
import { requestDelete } from '../../../../common/crud/Data';
import { idKeyFn } from '../../../../hub/useHubView';
import { API_PREFIX } from '../../../constants';
import { EdaUser } from '../../../interfaces/EdaUser';
import { useUserColumns } from './useUserColumns';

export function useDeleteUsers(onComplete: (Users: EdaUser[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useUserColumns();
  const actionColumns = useMemo(() => [confirmationColumns[0]], [confirmationColumns]);
  const bulkAction = useBulkConfirmation<EdaUser>();
  return useCallback(
    (users: EdaUser[]) => {
      bulkAction({
        title: t('Permanently delete users', { count: users.length }),
        confirmText: t('Yes, I confirm that I want to delete these {{count}} users.', {
          count: users.length,
        }),
        actionButtonText: t('Delete users', { count: users.length }),
        items: users.sort((l, r) => compareStrings(l.username, r.username)),
        keyFn: idKeyFn,
        isDanger: true,
        confirmationColumns,
        actionColumns,
        onComplete,
        actionFn: (user: EdaUser) => requestDelete(`${API_PREFIX}/users/${user.id}/`),
      });
    },
    [actionColumns, bulkAction, confirmationColumns, onComplete, t]
  );
}
