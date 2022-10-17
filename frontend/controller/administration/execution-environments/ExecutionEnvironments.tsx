import { ButtonVariant } from '@patternfly/react-core'
import { EditIcon, PlusIcon, TrashIcon } from '@patternfly/react-icons'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { IItemAction, ITableColumn, IToolbarFilter, ITypedAction, TablePage, TypedActionType } from '../../../../framework'
import {
    useCreatedColumn,
    useDescriptionColumn,
    useModifiedColumn,
    useNameColumn,
    useOrganizationNameColumn,
} from '../../../common/columns'
import { RouteE } from '../../../Routes'
import {
    useCreatedByToolbarFilter,
    useDescriptionToolbarFilter,
    useModifiedByToolbarFilter,
    useNameToolbarFilter,
    useOrganizationToolbarFilter,
} from '../../common/controller-toolbar-filters'
import { useControllerView } from '../../useControllerView'
import { ExecutionEnvironment } from './ExecutionEnvironment'
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
                label: t('Create execution environment'),
                onClick: () => navigate(RouteE.CreateExecutionEnvironment),
            },
            {
                type: TypedActionType.bulk,
                icon: TrashIcon,
                label: t('Delete selected execution environments'),
                onClick: deleteExecutionEnvironments,
            },
        ],
        [navigate, deleteExecutionEnvironments, t]
    )

    const rowActions = useMemo<IItemAction<ExecutionEnvironment>[]>(
        () => [
            {
                icon: EditIcon,
                label: t('Edit execution environment'),
                onClick: (executionEnvironment) =>
                    navigate(RouteE.EditExecutionEnvironment.replace(':id', executionEnvironment.id.toString())),
            },
            {
                icon: TrashIcon,
                label: t('Delete execution environment'),
                onClick: (executionEnvironment) => deleteExecutionEnvironments([executionEnvironment]),
            },
        ],
        [navigate, deleteExecutionEnvironments, t]
    )

    return (
        <TablePage<ExecutionEnvironment>
            title={t('Execution environments')}
            titleHelpTitle={t('Execution environments')}
            titleHelp={t('executionEnvironments.title.help')}
            titleDocLink="https://docs.ansible.com/automation-controller/latest/html/userguide/execution_environments.html"
            description={t('executionEnvironments.title.description')}
            toolbarFilters={toolbarFilters}
            toolbarActions={toolbarActions}
            tableColumns={tableColumns}
            rowActions={rowActions}
            errorStateTitle={t('Error loading execution environments')}
            emptyStateTitle={t('No execution environments yet')}
            emptyStateDescription={t('To get started, create an execution environment.')}
            emptyStateButtonText={t('Create execution environment')}
            emptyStateButtonClick={() => navigate(RouteE.CreateExecutionEnvironment)}
            {...view}
        />
    )
}

export function useExecutionEnvironmentsFilters() {
    const nameToolbarFilter = useNameToolbarFilter()
    const descriptionToolbarFilter = useDescriptionToolbarFilter()
    const organizationToolbarFilter = useOrganizationToolbarFilter()
    const createdByToolbarFilter = useCreatedByToolbarFilter()
    const modifiedByToolbarFilter = useModifiedByToolbarFilter()
    const toolbarFilters = useMemo<IToolbarFilter[]>(
        () => [nameToolbarFilter, descriptionToolbarFilter, organizationToolbarFilter, createdByToolbarFilter, modifiedByToolbarFilter],
        [nameToolbarFilter, descriptionToolbarFilter, organizationToolbarFilter, createdByToolbarFilter, modifiedByToolbarFilter]
    )
    return toolbarFilters
}

export function useExecutionEnvironmentsColumns(options?: { disableSort?: boolean; disableLinks?: boolean }) {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const nameClick = useCallback(
        (executionEnvironment: ExecutionEnvironment) =>
            navigate(RouteE.ExecutionEnvironmentDetails.replace(':id', executionEnvironment.id.toString())),
        [navigate]
    )
    const nameColumn = useNameColumn({
        ...options,
        onClick: nameClick,
    })
    const descriptionColumn = useDescriptionColumn()
    const organizationColumn = useOrganizationNameColumn(options)
    const createdColumn = useCreatedColumn(options)
    const modifiedColumn = useModifiedColumn(options)
    const tableColumns = useMemo<ITableColumn<ExecutionEnvironment>[]>(
        () => [
            nameColumn,
            descriptionColumn,
            {
                header: t('Image'),
                cell: (executionEnvironment) => executionEnvironment.image,
            },
            organizationColumn,
            createdColumn,
            modifiedColumn,
        ],
        [nameColumn, descriptionColumn, t, organizationColumn, createdColumn, modifiedColumn]
    )
    return tableColumns
}
