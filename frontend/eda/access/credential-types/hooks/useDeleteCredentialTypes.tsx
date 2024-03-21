import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings } from '../../../../../framework';
import { useNameColumn } from '../../../../common/columns';
import { requestDelete } from '../../../../common/crud/Data';
import { idKeyFn } from '../../../../common/utils/nameKeyFn';
import { edaAPI } from '../../../common/eda-utils';
import { EdaCredentialType } from '../../../interfaces/EdaCredentialType';
import { useEdaBulkConfirmation } from '../../../common/useEdaBulkConfirmation';
import { useCredentialTypesColumns } from './useCredentialTypesColumns';

export function useDeleteCredentialTypes(
  onComplete?: (credentialTypes: EdaCredentialType[]) => void
) {
  const { t } = useTranslation();
  const confirmationColumns = useCredentialTypesColumns();
  const deleteActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true });
  const actionColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn]);
  const bulkAction = useEdaBulkConfirmation<EdaCredentialType>();
  return useCallback(
    (credentialTypes: EdaCredentialType[]) => {
      bulkAction({
        title: t('Permanently delete credential types', { count: credentialTypes.length }),
        confirmText: t('Yes, I confirm that I want to delete these {{count}} credential types.', {
          count: credentialTypes.length,
        }),
        actionButtonText: t('Delete credential types', { count: credentialTypes.length }),
        items: credentialTypes.sort((l, r) => compareStrings(l.name, r.name)),
        keyFn: idKeyFn,
        isDanger: true,
        confirmationColumns,
        actionColumns,
        onComplete,
        actionFn: (credentialType: EdaCredentialType, signal) => {
          const url = edaAPI`/credential-types/${credentialType.id.toString()}/`;
          return requestDelete(url, signal);
        },
      });
    },
    [actionColumns, bulkAction, confirmationColumns, onComplete, t]
  );
}
