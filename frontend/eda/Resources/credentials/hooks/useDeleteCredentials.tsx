import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings, useBulkConfirmation } from '../../../../../framework';
import { requestDelete } from '../../../../common/crud/Data';
import { idKeyFn } from '../../../../hub/useHubView';
import { API_PREFIX } from '../../../constants';
import { EdaCredential } from '../../../interfaces/EdaCredential';
import { useCredentialColumns } from './useCredentialColumns';

export function useDeleteCredentials(onComplete: (credentials: EdaCredential[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useCredentialColumns();
  const actionColumns = useMemo(() => [confirmationColumns[0]], [confirmationColumns]);
  const bulkAction = useBulkConfirmation<EdaCredential>();
  return useCallback(
    (credentials: EdaCredential[]) => {
      bulkAction({
        title: t('Permanently delete credentials', { count: credentials.length }),
        confirmText: t('Yes, I confirm that I want to delete these {{count}} credentials.', {
          count: credentials.length,
        }),
        actionButtonText: t('Delete credentials', { count: credentials.length }),
        items: credentials.sort((l, r) => compareStrings(l.name, r.name)),
        keyFn: idKeyFn,
        isDanger: true,
        confirmationColumns,
        actionColumns,
        onComplete,
        actionFn: (credential: EdaCredential) =>
          requestDelete(`${API_PREFIX}/credentials/${credential.id}/`),
      });
    },
    [actionColumns, bulkAction, confirmationColumns, onComplete, t]
  );
}
