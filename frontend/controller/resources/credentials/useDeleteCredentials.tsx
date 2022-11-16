import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { compareStrings, useBulkConfirmation } from '../../../../framework'
import { useNameColumn } from '../../../common/columns'
import { getItemKey, requestDelete } from '../../../Data'
import { Credential } from '../../interfaces/Credential'
import { useCredentialsColumns } from './Credentials'

export function useDeleteCredentials(onComplete: (credentials: Credential[]) => void) {
  const { t } = useTranslation()
  const confirmationColumns = useCredentialsColumns({ disableLinks: true, disableSort: true })
  const deleteActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true })
  const actionColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn])
  const bulkAction = useBulkConfirmation<Credential>()
  const deleteCredentials = (credentials: Credential[]) => {
    bulkAction({
      title:
        credentials.length === 1
          ? t('Permanently delete credential')
          : t('Permanently delete credentials'),
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
      actionFn: (credential: Credential) => requestDelete(`/api/v2/credentials/${credential.id}/`),
    })
  }
  return deleteCredentials
}
