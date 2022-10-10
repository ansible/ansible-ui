import { ButtonVariant } from '@patternfly/react-core'
import { EditIcon, PlusIcon, TrashIcon } from '@patternfly/react-icons'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { IItemAction, ITableColumn, IToolbarFilter, ITypedAction, TablePage, TypedActionType } from '../../../../framework'
import { useCreatedColumn, useDescriptionColumn, useModifiedColumn, useNameColumn } from '../../../common/columns'
import {
    useCreatedByToolbarFilter,
    useDescriptionToolbarFilter,
    useModifiedByToolbarFilter,
    useNameToolbarFilter,
} from '../../../common/controller-toolbar-filters'
import { RouteE } from '../../../route'
import { useControllerView } from '../../useControllerView'
import { ExecutionEnvironment } from './ExecutionEnvironments'
import { useDeleteExecutionEnvironments } from './useDeleteExecutionEnvironments'

export function ExecutionEnvironments() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const toolbarFilters = useExecutionEnvironmentsFilters()
    const tableColumns = useExecutionEnvironmentsColumns()
    const view = useControllerView<ExecutionEnvironment>('/api/v2/execution_environments/', toolbarFilters, tableColumns)
    const deleteExecutionEnvironments = useDeleteExecutionEnvironments((deleted: ExecutionEnvironment[]) => {
        for (const executionEnvironment of deleted) {
            view.unselectItem(executionEnvironment)
        }
        void view.refresh()
    })

    const toolbarActions = useMemo<ITypedAction<ExecutionEnvironment>[]>(
        () => [
            {
                type: TypedActionType.button,
                variant: ButtonVariant.primary,
                icon: PlusIcon,
                label: t('Create executionEnvironment'),
                onClick: () => navigate(RouteE.CreateExecutionEnvironment),
            },
            {
                type: TypedActionType.bulk,
                icon: TrashIcon,
                label: t('Delete selected executionEnvironments'),
                onClick: deleteExecutionEnvironments,
            },
        ],
        [navigate, deleteExecutionEnvironments, t]
    )

    const rowActions = useMemo<IItemAction<ExecutionEnvironment>[]>(
        () => [
            {
                icon: EditIcon,
                label: t('Edit executionEnvironment'),
                onClick: (executionEnvironment) =>
                    navigate(RouteE.EditExecutionEnvironment.replace(':id', executionEnvironment.id.toString())),
            },
            {
                icon: TrashIcon,
                label: t('Delete executionEnvironment'),
                onClick: (executionEnvironment) => deleteExecutionEnvironments([executionEnvironment]),
            },
        ],
        [navigate, deleteExecutionEnvironments, t]
    )

    return (
        <TablePage<ExecutionEnvironment>
            title={t('ExecutionEnvironments')}
            titleHelpTitle={t('ExecutionEnvironments')}
            titleHelp={t('executionEnvironments.title.help')}
            titleDocLink="https://docs.ansible.com/ansible-tower/latest/html/userguide/executionEnvironments.html"
            description={t('executionEnvironments.title.description')}
            toolbarFilters={toolbarFilters}
            toolbarActions={toolbarActions}
            tableColumns={tableColumns}
            rowActions={rowActions}
            errorStateTitle={t('Error loading executionEnvironments')}
            emptyStateTitle={t('No executionEnvironments yet')}
            emptyStateDescription={t('To get started, create an executionEnvironment.')}
            emptyStateButtonText={t('Create executionEnvironment')}
            emptyStateButtonClick={() => navigate(RouteE.CreateExecutionEnvironment)}
            {...view}
        />
    )
}

export function useExecutionEnvironmentsFilters() {
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

export function useExecutionEnvironmentsColumns(options?: { disableSort?: boolean; disableLinks?: boolean }) {
    // const navigate = useNavigate()
    // const nameClick = useCallback(
    //     (executionEnvironment: ExecutionEnvironment) => navigate(RouteE.ExecutionEnvironmentDetails.replace(':id', executionEnvironment.id.toString())),
    //     [navigate]
    // )
    const nameColumn = useNameColumn({
        ...options,
        // onClick: nameClick,
    })
    const descriptionColumn = useDescriptionColumn()
    const createdColumn = useCreatedColumn(options)
    const modifiedColumn = useModifiedColumn(options)
    const tableColumns = useMemo<ITableColumn<ExecutionEnvironment>[]>(
        () => [nameColumn, descriptionColumn, createdColumn, modifiedColumn],
        [nameColumn, descriptionColumn, createdColumn, modifiedColumn]
    )
    return tableColumns
}
