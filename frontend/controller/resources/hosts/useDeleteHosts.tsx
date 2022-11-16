import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { BulkConfirmationDialog, compareStrings, usePageDialog } from '../../../../framework'
import { useNameColumn } from '../../../common/columns'
import { getItemKey, requestDelete } from '../../../Data'
import { Host } from '../../interfaces/Host'
import { useHostsColumns } from './Hosts'

export function useDeleteHosts(callback: (hosts: Host[]) => void) {
  const { t } = useTranslation()
  const [_, setDialog] = usePageDialog()
  const columns = useHostsColumns({ disableLinks: true, disableSort: true })
  const deleteActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true })
  const errorColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn])
  const deleteHosts = (items: Host[]) => {
    setDialog(
      <BulkConfirmationDialog<Host>
        title={t('Permanently delete hosts', { count: items.length })}
        confirmText={t('Yes, I confirm that I want to delete these {{count}} hosts.', {
          count: items.length,
        })}
        submitText={t('Delete hosts', { count: items.length })}
        submitting={t('Deleting hosts', { count: items.length })}
        submittingTitle={t('Deleting {{count}} hosts', { count: items.length })}
        error={t('There were errors deleting hosts', { count: items.length })}
        items={items.sort((l, r) => compareStrings(l.name, r.name))}
        keyFn={getItemKey}
        isDanger
        columns={columns}
        errorColumns={errorColumns}
        onConfirm={callback}
        action={(host: Host) => requestDelete(`/api/v2/hosts/${host.id}/`)}
      />
    )
  }
  return deleteHosts
}
