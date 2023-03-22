import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings, useBulkConfirmation } from '../../../../../framework';
import { requestDelete } from '../../../../common/crud/Data';
import { idKeyFn } from '../../../../hub/useHubView';
import { API_PREFIX } from '../../../constants';
import { EdaRole } from '../../../interfaces/EdaRole';
import { useRoleColumns } from './useRoleColumns';

export function useDeleteRoles(onComplete: (roles: EdaRole[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useRoleColumns();
  const actionColumns = useMemo(() => [confirmationColumns[0]], [confirmationColumns]);
  const bulkAction = useBulkConfirmation<EdaRole>();
  return useCallback(
    (roles: EdaRole[]) => {
      bulkAction({
        title: t('Permanently delete Roles', { count: roles.length }),
        confirmText: t('Yes, I confirm that I want to delete these {{count}} Roles.', {
          count: roles.length,
        }),
        actionButtonText: t('Delete Roles', { count: roles.length }),
        items: roles.sort((l, r) => compareStrings(l.name, r.name)),
        keyFn: idKeyFn,
        isDanger: true,
        confirmationColumns,
        actionColumns,
        onComplete,
        actionFn: (role: EdaRole) => requestDelete(`${API_PREFIX}/roles/${role.id}/`),
      });
    },
    [actionColumns, bulkAction, confirmationColumns, onComplete, t]
  );
}
