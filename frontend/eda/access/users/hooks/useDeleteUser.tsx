import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings } from '../../../../../framework';
import { requestDelete } from '../../../../common/crud/Data';
import { idKeyFn } from '../../../../common/utils/nameKeyFn';
import { edaAPI } from '../../../common/eda-utils';
import { EdaUser } from '../../../interfaces/EdaUser';
import { useEdaBulkConfirmation } from '../../../common/useEdaBulkConfirmation';
import { useUserColumns } from './useUserColumns';

export function useDeleteUsers(onComplete: (users: EdaUser[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useUserColumns();
  const actionColumns = useMemo(() => [confirmationColumns[0]], [confirmationColumns]);
  const bulkAction = useEdaBulkConfirmation<EdaUser>();
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
        actionFn: (user: EdaUser, signal) =>
          requestDelete(edaAPI`/users/${user.id.toString()}/`, signal),
      });
    },
    [actionColumns, bulkAction, confirmationColumns, onComplete, t]
  );
}
