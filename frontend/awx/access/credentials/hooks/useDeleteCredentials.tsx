import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings } from '../../../../../framework';
import { useNameColumn } from '../../../../common/columns';
import { getItemKey, requestDelete } from '../../../../common/crud/Data';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxBulkConfirmation } from '../../../common/useAwxBulkConfirmation';
import { Credential } from '../../../interfaces/Credential';
import { useCredentialsColumns } from './useCredentialsColumns';

export function useDeleteCredentials(onComplete?: (credentials: Credential[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useCredentialsColumns({ disableLinks: true, disableSort: true });
  const deleteActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true });
  const actionColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn]);
  const bulkAction = useAwxBulkConfirmation<Credential>();
  const deleteCredentials = (credentials: Credential[]) => {
    bulkAction({
      title: t('Permanently delete credentials', { count: credentials.length }),
      confirmText: t('Yes, I confirm that I want to delete these {{count}} credentials.', {
        count: credentials.length,
      }),
      actionButtonText: t('Delete credential', { count: credentials.length }),
      items: credentials.sort((l, r) => compareStrings(l.name, r.name)),
      keyFn: getItemKey,
      isDanger: true,
      confirmationColumns,
      actionColumns,
      onComplete,
      actionFn: (credential: Credential, signal) =>
        requestDelete(awxAPI`/credentials/${credential.id.toString()}/`, signal),
    });
  };
  return deleteCredentials;
}
