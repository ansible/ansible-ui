import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { BulkActionDialog, compareStrings, usePageDialog } from '../../../../framework'
import { useNameColumn } from '../../../common/columns'
import { getItemKey, requestDelete } from '../../../Data'
import { Credential } from './Credential'
import { useCredentialsColumns } from './Credentials'

export function useDeleteCredentials(callback: (credentials: Credential[]) => void) {
    const { t } = useTranslation()
    const [_, setDialog] = usePageDialog()
    const columns = useCredentialsColumns({ disableLinks: true, disableSort: true })
    const deleteActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true })
    const errorColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn])
    const deleteCredentials = (items: Credential[]) => {
        setDialog(
            <BulkActionDialog<Credential>
                title={t('Permanently delete credentials', { count: items.length })}
                confirmText={t(
                    'Yes, I confirm that I want to delete these {{count}} credentials.',
                    { count: items.length }
                )}
                submitText={t('Delete credentials', { count: items.length })}
                submitting={t('Deleting credentials', { count: items.length })}
                submittingTitle={t('Deleting {{count}} credentials', { count: items.length })}
                error={t('There were errors deleting credentials', { count: items.length })}
                items={items.sort((l, r) => compareStrings(l.name, r.name))}
                keyFn={getItemKey}
                isDanger
                columns={columns}
                errorColumns={errorColumns}
                onClose={callback}
                action={(credential: Credential) =>
                    requestDelete(`/api/v2/credentials/${credential.id}/`)
                }
            />
        )
    }
    return deleteCredentials
}
