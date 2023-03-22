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
    (Users: EdaUser[]) => {
      bulkAction({
        title: t('Permanently delete Users', { count: Users.length }),
        confirmText: t('Yes, I confirm that I want to delete these {{count}} Users.', {
          count: Users.length,
        }),
        actionButtonText: t('Delete Users', { count: Users.length }),
        items: Users.sort((l, r) => compareStrings(l.name, r.name)),
        keyFn: idKeyFn,
        isDanger: true,
        confirmationColumns,
        actionColumns,
        onComplete,
        actionFn: (User: EdaUser) => requestDelete(`${API_PREFIX}/Users/${User.id}/`),
      });
    },
    [actionColumns, bulkAction, confirmationColumns, onComplete, t]
  );
}
