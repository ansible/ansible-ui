import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings } from '../../../../../framework';
import { useNameColumn } from '../../../../common/columns';
import { requestDelete } from '../../../../common/crud/Data';
import { idKeyFn } from '../../../../common/utils/nameKeyFn';
import { InUseResources } from '../../../common/EdaResourcesComon';
import { edaAPI } from '../../../common/eda-utils';
import { EdaCredential } from '../../../interfaces/EdaCredential';
import { useCredentialColumns } from './useCredentialColumns';
import { useEdaBulkConfirmation } from '../../../common/useEdaBulkConfirmation';

export function useDeleteCredentials(onComplete?: (credentials: EdaCredential[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useCredentialColumns();
  const deleteActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true });
  const actionColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn]);
  const bulkAction = useEdaBulkConfirmation<EdaCredential>();
  return useCallback(
    async (credentials: EdaCredential[]) => {
      const inUseDes = await InUseResources(credentials, edaAPI`/activations/?eda_credential_id=`);
      const inUseMessage =
        inUseDes && inUseDes.length > 0
          ? [t(`The following credentials are in use: ${inUseDes.join()}`)]
          : [];
      const forceParameter = inUseMessage.length > 0 ? '?force=true' : '';

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
        alertPrompts: inUseMessage,
        actionFn: (credential: EdaCredential, signal) => {
          const url = edaAPI`/eda-credentials/${credential.id.toString()}/`;
          return requestDelete(url + forceParameter, signal);
        },
      });
    },
    [actionColumns, bulkAction, confirmationColumns, onComplete, t]
  );
}
