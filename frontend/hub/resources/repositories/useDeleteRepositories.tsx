import { useTranslation } from 'react-i18next'
import { BulkActionDialog, compareStrings, usePageDialog } from '../../../../framework'
import { requestDelete } from '../../../Data'
import { hubKeyFn } from '../../useHubView'
import { useRepositoriesColumns } from './Repositories'
import { Repository } from './Repository'

export function useDeleteRepositories(callback: (repositories: Repository[]) => void) {
    const { t } = useTranslation()
    const [_, setDialog] = usePageDialog()
    const columns = useRepositoriesColumns({ disableLinks: true, disableSort: true })
    // const deleteActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true })
    // const errorColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn])
    const deleteRepositories = (items: Repository[]) => {
        setDialog(
            <BulkActionDialog<Repository>
                title={t('Permanently delete repositories', { count: items.length })}
                confirmText={t('Yes, I confirm that I want to delete these {{count}} repositories.', { count: items.length })}
                submitText={t('Delete repositories', { count: items.length })}
                submitting={t('Deleting repositories', { count: items.length })}
                submittingTitle={t('Deleting {{count}} repositories', { count: items.length })}
                error={t('There were errors deleting repositories', { count: items.length })}
                items={items.sort((l, r) => compareStrings(l.name, r.name))}
                keyFn={hubKeyFn}
                isDanger
                columns={columns}
                errorColumns={columns}
                onClose={callback}
                action={(repository: Repository) => requestDelete(`/api/v2/repositories/${repository.pulp_id}/`)}
            />
        )
    }
    return deleteRepositories
}
