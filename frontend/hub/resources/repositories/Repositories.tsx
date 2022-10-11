import { ButtonVariant } from '@patternfly/react-core'
import { EditIcon, PlusIcon, TrashIcon } from '@patternfly/react-icons'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
    IItemAction,
    ITableColumn,
    IToolbarFilter,
    ITypedAction,
    SinceCell,
    TablePage,
    TextCell,
    TypedActionType,
} from '../../../../framework'
import {
    useCreatedByToolbarFilter,
    useDescriptionToolbarFilter,
    useModifiedByToolbarFilter,
    useNameToolbarFilter,
} from '../../../common/controller-toolbar-filters'
import { RouteE } from '../../../Routes'
import { useHubView } from '../../useHubView'
import { Repository } from './Repository'
import { useDeleteRepositories } from './useDeleteRepositories'

export function Repositories() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const toolbarFilters = useRepositoriesFilters()
    const tableColumns = useRepositoriesColumns()
    const view = useHubView<Repository>('/api/automation-hub/_ui/v1/distributions/', toolbarFilters, tableColumns)
    const deleteRepositories = useDeleteRepositories((deleted: Repository[]) => {
        for (const repository of deleted) {
            view.unselectItem(repository)
        }
        void view.refresh()
    })

    const toolbarActions = useMemo<ITypedAction<Repository>[]>(
        () => [
            {
                type: TypedActionType.button,
                variant: ButtonVariant.primary,
                icon: PlusIcon,
                label: t('Create repository'),
                onClick: () => navigate(RouteE.CreateRepository),
            },
            {
                type: TypedActionType.bulk,
                icon: TrashIcon,
                label: t('Delete selected repositories'),
                onClick: deleteRepositories,
            },
        ],
        [navigate, deleteRepositories, t]
    )

    const rowActions = useMemo<IItemAction<Repository>[]>(
        () => [
            {
                icon: EditIcon,
                label: t('Edit repository'),
                onClick: (repository) => navigate(RouteE.EditRepository.replace(':id', repository.id.toString())),
            },
            {
                icon: TrashIcon,
                label: t('Delete repository'),
                onClick: (repository) => deleteRepositories([repository]),
            },
        ],
        [navigate, deleteRepositories, t]
    )

    return (
        <TablePage<Repository>
            title={t('Repositories')}
            toolbarFilters={toolbarFilters}
            toolbarActions={toolbarActions}
            tableColumns={tableColumns}
            rowActions={rowActions}
            errorStateTitle={t('Error loading repositories')}
            emptyStateTitle={t('No repositories yet')}
            emptyStateDescription={t('To get started, create an repository.')}
            emptyStateButtonText={t('Create repository')}
            emptyStateButtonClick={() => navigate(RouteE.CreateRepository)}
            {...view}
        />
    )
}

export function useRepositoriesFilters() {
    const nameToolbarFilter = useNameToolbarFilter()
    const descriptionToolbarFilter = useDescriptionToolbarFilter()
    const createdByToolbarFilter = useCreatedByToolbarFilter()
    const modifiedByToolbarFilter = useModifiedByToolbarFilter()
    const toolbarFilters = useMemo<IToolbarFilter[]>(
        () => [nameToolbarFilter, descriptionToolbarFilter, createdByToolbarFilter, modifiedByToolbarFilter],
        [nameToolbarFilter, descriptionToolbarFilter, createdByToolbarFilter, modifiedByToolbarFilter]
    )
    return toolbarFilters
}

export function useRepositoriesColumns(options?: { disableSort?: boolean; disableLinks?: boolean }) {
    const tableColumns = useMemo<ITableColumn<Repository>[]>(
        () => [
            { header: 'Name', cell: (repository) => <TextCell text={repository.name} />, sort: 'name' },
            { header: 'Repository', cell: (repository) => <TextCell text={repository.repository.name} /> },
            { header: 'Description', cell: (repository) => <TextCell text={repository.repository.description} /> },
            { header: 'Collections', cell: (repository) => <TextCell text={repository.repository.content_count.toString()} /> },
            { header: 'Modified', cell: (repository) => <SinceCell value={repository.repository.pulp_last_updated} /> },
        ],
        []
    )
    return tableColumns
}
