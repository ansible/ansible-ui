import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings, useBulkConfirmation } from '../../../../../framework';
import { requestDelete } from '../../../../common/crud/Data';
import { idKeyFn } from '../../../../common/utils/nameKeyFn';
import { API_PREFIX } from '../../../constants';
import { EdaCredential } from '../../../interfaces/EdaCredential';
import { useCredentialColumns } from './useCredentialColumns';
import { useNameColumn } from '../../../../common/columns';
import { InUseResources } from '../../../common/EdaResourcesComon';

export function useDeleteCredentials(onComplete?: (credentials: EdaCredential[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useCredentialColumns();
  const deleteActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true });
  const actionColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn]);
  const bulkAction = useBulkConfirmation<EdaCredential>();
  return useCallback(
    async (credentials: EdaCredential[]) => {
      const inUseDes = await InUseResources(
        credentials,
        `${API_PREFIX}/activations/?credential_id=`
      );
      const inUseMessage =
        inUseDes && inUseDes.length > 0
          ? [t(`The following decision environments are in use: ${inUseDes.join()}`)]
          : [];
      const forceParameter = inUseMessage.length > 0 ? '?force=true' : '';

      bulkAction({
        title:
          credentials.length === 1
            ? t('Permanently delete credential')
            : t('Permanently delete credentials'),
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
        alertPrompts: inUseMessage,
        actionFn: (credential: EdaCredential) =>
          requestDelete(`${API_PREFIX}/credentials/${credential.id}/${forceParameter}`),
      });
    },
    [actionColumns, bulkAction, confirmationColumns, onComplete, t]
  );
}
