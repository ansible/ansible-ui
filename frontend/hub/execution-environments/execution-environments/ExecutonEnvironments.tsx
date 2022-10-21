import { ButtonVariant } from '@patternfly/react-core'
import { EditIcon, PlusIcon } from '@patternfly/react-icons'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
    IItemAction,
    ITableColumn,
    IToolbarFilter,
    ITypedAction,
    PageBody,
    PageHeader,
    PageLayout,
    PageTable,
    TextCell,
    TypedActionType,
} from '../../../../framework'
import { useCreatedColumn, useDescriptionColumn } from '../../../common/columns'
import { idKeyFn, useHubView } from '../../useHubView'
import { ExecutionEnvironment } from './ExecutionEnvironment'

export function ExecutionEnvironments() {
    const { t } = useTranslation()
    const toolbarFilters = useExecutionEnvironmentFilters()
    const tableColumns = useExecutionEnvironmentsColumns()
    const view = useHubView<ExecutionEnvironment>(
        '/api/automation-hub/_ui/v1/execution-environments/repositories/',
        idKeyFn,
        toolbarFilters,
        tableColumns
    )
    const toolbarActions = useMemo<ITypedAction<ExecutionEnvironment>[]>(
        () => [
            {
                type: TypedActionType.button,
                variant: ButtonVariant.primary,
                icon: PlusIcon,
                label: t('Add execution environment'),
                onClick: () => {
                    /**/
                },
            },
        ],
        [t]
    )
    const rowActions = useMemo<IItemAction<ExecutionEnvironment>[]>(
        () => [
            {
                icon: EditIcon,
                label: t('Edit'),
                onClick: () => {
                    /**/
                },
            },
        ],
        [t]
    )
    return (
        <PageLayout>
            <PageHeader title={t('Execution environments')} />
            <PageBody>
                <PageTable<ExecutionEnvironment>
                    toolbarFilters={toolbarFilters}
                    tableColumns={tableColumns}
                    toolbarActions={toolbarActions}
                    rowActions={rowActions}
                    errorStateTitle={t('Error loading execution environments')}
                    emptyStateTitle={t('No execution environments yet')}
                    {...view}
                />
            </PageBody>
        </PageLayout>
    )
}

export function useExecutionEnvironmentsColumns(_options?: {
    disableSort?: boolean
    disableLinks?: boolean
}) {
    const { t } = useTranslation()
    const descriptionColumn = useDescriptionColumn()
    const createdColumn = useCreatedColumn()
    const tableColumns = useMemo<ITableColumn<ExecutionEnvironment>[]>(
        () => [
            {
                header: t('Collection repository'),
                cell: (executionEnvironment) => <TextCell text={executionEnvironment.name} />,
            },
            descriptionColumn,
            createdColumn,
        ],
        [createdColumn, descriptionColumn, t]
    )
    return tableColumns
}

export function useExecutionEnvironmentFilters() {
    const { t } = useTranslation()
    const toolbarFilters = useMemo<IToolbarFilter[]>(
        () => [{ key: 'name', label: t('Name'), type: 'string', query: 'name' }],
        [t]
    )
    return toolbarFilters
}
