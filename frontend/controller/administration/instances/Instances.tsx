import { ButtonVariant, Progress, ProgressMeasureLocation } from '@patternfly/react-core'
import { EditIcon, PlusIcon, TrashIcon } from '@patternfly/react-icons'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { IItemAction, ITableColumn, IToolbarFilter, ITypedAction, SinceCell, TablePage, TypedActionType } from '../../../../framework'
import { useCreatedColumn, useModifiedColumn } from '../../../common/columns'
import { StatusCell } from '../../../common/StatusCell'
import { RouteE } from '../../../Routes'
import {
    useCreatedByToolbarFilter,
    useDescriptionToolbarFilter,
    useModifiedByToolbarFilter,
    useNameToolbarFilter,
    useOrganizationToolbarFilter,
} from '../../common/controller-toolbar-filters'
import { useControllerView } from '../../useControllerView'
import { Instance } from './Instance'
import { useDeleteInstances } from './useInstances'

export function Instances() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const toolbarFilters = useInstancesFilters()
    const tableColumns = useInstancesColumns()
    const view = useControllerView<Instance>('/api/v2/instances/', toolbarFilters, tableColumns)
    const deleteInstances = useDeleteInstances((deleted: Instance[]) => {
        for (const instance of deleted) {
            view.unselectItem(instance)
        }
        void view.refresh()
    })

    const toolbarActions = useMemo<ITypedAction<Instance>[]>(
        () => [
            {
                type: TypedActionType.button,
                variant: ButtonVariant.primary,
                icon: PlusIcon,
                label: t('Create instance'),
                onClick: () => navigate(RouteE.CreateInstance),
            },
            {
                type: TypedActionType.bulk,
                icon: TrashIcon,
                label: t('Delete selected instances'),
                onClick: deleteInstances,
            },
        ],
        [navigate, deleteInstances, t]
    )

    const rowActions = useMemo<IItemAction<Instance>[]>(
        () => [
            {
                icon: EditIcon,
                label: t('Edit instance'),
                onClick: (instance) => navigate(RouteE.EditInstance.replace(':id', instance.id.toString())),
            },
            {
                icon: TrashIcon,
                label: t('Delete instance'),
                onClick: (instance) => deleteInstances([instance]),
            },
        ],
        [navigate, deleteInstances, t]
    )

    return (
        <TablePage<Instance>
            title={t('Instances')}
            toolbarFilters={toolbarFilters}
            toolbarActions={toolbarActions}
            tableColumns={tableColumns}
            rowActions={rowActions}
            errorStateTitle={t('Error loading instances')}
            emptyStateTitle={t('No instances yet')}
            emptyStateDescription={t('To get started, create an instance.')}
            emptyStateButtonText={t('Create instance')}
            emptyStateButtonClick={() => navigate(RouteE.CreateInstance)}
            {...view}
        />
    )
}

export function useInstancesFilters() {
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

export function useInstancesColumns(options?: { disableSort?: boolean; disableLinks?: boolean }) {
    const { t } = useTranslation()
    // const navigate = useNavigate()
    const createdColumn = useCreatedColumn(options)
    const modifiedColumn = useModifiedColumn(options)
    const tableColumns = useMemo<ITableColumn<Instance>[]>(
        () => [
            {
                header: t('Name'),
                cell: (instance) => instance.hostname,
                sort: 'hostname',
            },
            {
                header: t('Status'),
                cell: (instance) => <StatusCell status={!instance.enabled ? 'disabled' : instance.errors ? 'error' : 'healthy'} />,
                sort: 'errors',
            },
            {
                header: t('Node type'),
                cell: (instance) => instance.node_type,
                sort: 'node_type',
            },
            // {
            //     header: t('CPU'),
            //     cell: (instance) => (
            //         <Progress
            //             value={instance.cpu / instance.cpu_capacity}
            //             measureLocation={ProgressMeasureLocation.none}
            //             aria-label="Title"
            //         />
            //     ),
            //     sort: 'node_type',
            // },
            // {
            //     header: t('Memory'),
            //     cell: (instance) => (
            //         <Progress
            //             value={instance.memory / instance.mem_capacity}
            //             measureLocation={ProgressMeasureLocation.none}
            //             aria-label="Title"
            //         />
            //     ),
            //     sort: 'node_type',
            // },
            {
                header: t('Used capacity'),
                cell: (instance) => (
                    <Progress
                        value={instance.consumed_capacity / instance.capacity}
                        measureLocation={ProgressMeasureLocation.none}
                        aria-label="Title"
                    />
                ),
                sort: 'node_type',
            },
            {
                header: t('Running jobs'),
                cell: (instance) => instance.jobs_running,
            },
            {
                header: t('Total jobs'),
                cell: (instance) => instance.jobs_total,
            },
            {
                header: t('Policy type'),
                cell: (instance) => (instance.managed_by_policy ? t('Auto') : t('Manual')),
            },
            {
                header: t('Last health check'),
                cell: (instance) => <SinceCell value={instance.last_health_check} />,
            },
            createdColumn,
            modifiedColumn,
        ],
        [t, createdColumn, modifiedColumn]
    )
    return tableColumns
}
