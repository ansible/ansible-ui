import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings, useBulkConfirmation } from '../../../../../framework';
import { requestDelete } from '../../../../common/crud/Data';
import { idKeyFn } from '../../../../hub/useHubView';
import { API_PREFIX } from '../../../constants';
import { EdaControllerToken } from '../../../interfaces/EdaControllerToken';
import { useControllerTokensColumns } from './useControllerTokensColumns';

export function useDeleteControllerTokens(onComplete: (credentials: EdaControllerToken[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useControllerTokensColumns();
  const actionColumns = useMemo(() => [confirmationColumns[0]], [confirmationColumns]);
  const bulkAction = useBulkConfirmation<EdaControllerToken>();
  return useCallback(
    (controllerTokens: EdaControllerToken[]) => {
      bulkAction({
        title: t('Permanently delete controller tokens', { count: controllerTokens.length }),
        confirmText: t('Yes, I confirm that I want to delete these {{count}} controller tokens.', {
          count: controllerTokens.length,
        }),
        actionButtonText: t('Delete controller tokens', { count: controllerTokens.length }),
        items: controllerTokens.sort((l, r) => compareStrings(l.name, r.name)),
        keyFn: idKeyFn,
        isDanger: true,
        confirmationColumns,
        actionColumns,
        onComplete,
        actionFn: (token: EdaControllerToken) =>
          requestDelete(`${API_PREFIX}/users/me/awx-tokens/${token.id}/`),
      });
    },
    [actionColumns, bulkAction, confirmationColumns, onComplete, t]
  );
}
