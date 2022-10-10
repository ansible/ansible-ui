import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { BulkActionDialog, compareStrings, usePageDialog } from '../../../../framework'
import { useNameColumn } from '../../../common/columns'
import { getItemKey, requestDelete } from '../../../Data'
import { ExecutionEnvironment } from './ExecutionEnvironment'
import { useExecutionEnvironmentsColumns } from './ExecutionEnvironments'

export function useDeleteExecutionEnvironments(callback: (executionEnvironments: ExecutionEnvironment[]) => void) {
    const { t } = useTranslation()
    const [_, setDialog] = usePageDialog()
    const columns = useExecutionEnvironmentsColumns({ disableLinks: true, disableSort: true })
    const deleteActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true })
    const errorColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn])
    const deleteExecutionEnvironments = (items: ExecutionEnvironment[]) => {
        setDialog(
            <BulkActionDialog<ExecutionEnvironment>
                title={t('Permanently delete executionEnvironments', { count: items.length })}
                confirmText={t('Yes, I confirm that I want to delete these {{count}} executionEnvironments.', { count: items.length })}
                submitText={t('Delete executionEnvironments', { count: items.length })}
                submitting={t('Deleting executionEnvironments', { count: items.length })}
                submittingTitle={t('Deleting {{count}} executionEnvironments', { count: items.length })}
                error={t('There were errors deleting executionEnvironments', { count: items.length })}
                items={items.sort((l, r) => compareStrings(l.name, r.name))}
                keyFn={getItemKey}
                isDanger
                columns={columns}
                errorColumns={errorColumns}
                onClose={callback}
                action={(executionEnvironment: ExecutionEnvironment) =>
                    requestDelete(`/api/v2/execution_environments/${executionEnvironment.id}/`)
                }
            />
        )
    }
    return deleteExecutionEnvironments
}
