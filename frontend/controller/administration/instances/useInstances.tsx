import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { BulkActionDialog, compareStrings, usePageDialog } from '../../../../framework'
import { getItemKey, requestDelete } from '../../../Data'
import { Instance } from './Instance'
import { useInstancesColumns } from './Instances'

export function useDeleteInstances(callback: (instances: Instance[]) => void) {
    const { t } = useTranslation()
    const [_, setDialog] = usePageDialog()
    const columns = useInstancesColumns({ disableLinks: true, disableSort: true })
    const errorColumns = useMemo(() => [{ header: t('Name'), cell: (instance: Instance) => instance.hostname }], [t])
    const deleteInstances = (items: Instance[]) => {
        setDialog(
            <BulkActionDialog<Instance>
                title={t('Permanently delete instances', { count: items.length })}
                confirmText={t('Yes, I confirm that I want to delete these {{count}} instances.', { count: items.length })}
                submitText={t('Delete instances', { count: items.length })}
                submitting={t('Deleting instances', { count: items.length })}
                submittingTitle={t('Deleting {{count}} instances', { count: items.length })}
                error={t('There were errors deleting instances', { count: items.length })}
                items={items.sort((l, r) => compareStrings(l.hostname, r.hostname))}
                keyFn={getItemKey}
                isDanger
                columns={columns}
                errorColumns={errorColumns}
                onClose={callback}
                action={(instance: Instance) => requestDelete(`/api/v2/instances/${instance.id}/`)}
            />
        )
    }
    return deleteInstances
}
