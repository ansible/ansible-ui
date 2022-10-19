import { ButtonVariant, Tooltip } from '@patternfly/react-core'
import { EditIcon } from '@patternfly/react-icons'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
    BytesCell,
    CapacityCell,
    IItemAction,
    ITableColumn,
    IToolbarFilter,
    ITypedAction,
    SinceCell,
    TablePage,
    TextCell,
    TypedActionType,
} from '../../../../framework'
import { Dotted } from '../../../../framework/components/Dotted'
import { useCreatedColumn, useModifiedColumn } from '../../../common/columns'
import { StatusCell } from '../../../common/StatusCell'
import { requestPost } from '../../../Data'
import { RouteE } from '../../../Routes'
import { useControllerView } from '../../useControllerView'
import { Instance } from './Instance'

export function Instances() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const toolbarFilters = useInstancesFilters()
    const tableColumns = useInstancesColumns()
    const view = useControllerView<Instance>('/api/v2/instances/', toolbarFilters, tableColumns)

    const toolbarActions = useMemo<ITypedAction<Instance>[]>(
        () => [
            {
                type: TypedActionType.bulk,
                variant: ButtonVariant.primary,
                label: t('Run health check'),
                onClick: (instances) => {
                    for (const instance of instances) {
                        // eslint-disable-next-line no-console
                        requestPost(`/api/v2/instances/${instance.id}/health_check/`, {}).catch(console.error)
                    }
                },
            },
        ],
        [t]
    )

    const rowActions = useMemo<IItemAction<Instance>[]>(
        () => [
            {
                icon: EditIcon,
                label: t('Edit instance'),
                onClick: (instance) => navigate(RouteE.EditInstance.replace(':id', instance.id.toString())),
            },
        ],
        [navigate, t]
    )

    return (
        <TablePage<Instance>
            title={t('Node instances')}
            description={t('Ansible node instances dedicated for a particular purpose indicated by node type.')}
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
    const { t } = useTranslation()
    const toolbarFilters = useMemo<IToolbarFilter[]>(
        () => [
            { key: 'name', label: t('Name'), type: 'string', query: 'hostname__icontains', placeholder: t('Enter name') },
            {
                key: 'type',
                label: t('Node type'),
                type: 'select',
                query: 'node_type',
                options: [
                    { label: t('Hybrid'), value: 'hybrid' },
                    { label: t('Execution'), value: 'execution' },
                    { label: t('Control'), value: 'control' },
                    { label: t('Hop'), value: 'hop' },
                ],
                placeholder: t('Select types'),
            },
        ],
        [t]
    )
    return toolbarFilters
}

export function useInstancesColumns(options?: { disableSort?: boolean; disableLinks?: boolean }) {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const createdColumn = useCreatedColumn(options)
    const modifiedColumn = useModifiedColumn(options)
    const tableColumns = useMemo<ITableColumn<Instance>[]>(
        () => [
            {
                header: t('Name'),
                cell: (instance) => (
                    <TextCell
                        onClick={() => navigate(RouteE.InstanceDetails.replace(':id', instance.id.toString()))}
                        text={instance.hostname}
                    />
                ),
                sort: 'hostname',
            },
            {
                header: t('Status'),
                cell: (instance) => <StatusCell status={!instance.enabled ? 'disabled' : instance.errors ? 'error' : 'healthy'} />,
                sort: 'errors',
            },
            {
                header: t('Node type'),
                cell: (instance) => <NodeTypeCell node_type={instance.node_type} />,
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
                header: t('Used capacity'),
                cell: (instance) => <CapacityCell used={instance.consumed_capacity} capacity={instance.capacity} />,
            },
            {
                header: t('Memory'),
                cell: (instance) => <BytesCell bytes={instance.memory} />,
                sort: 'memory',
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
        [t, createdColumn, modifiedColumn, navigate]
    )
    return tableColumns
}

export function NodeTypeCell(props: { node_type: string }) {
    const { t } = useTranslation()
    switch (props.node_type) {
        case 'hybrid':
            return (
                <Tooltip
                    content={t(
                        'Hybrid is the default node type for control plane nodes, responsible for automation controller runtime functions like project updates, management jobs and ansible-runner task operations. Hybrid nodes are also used for automation execution.'
                    )}
                >
                    <Dotted>{t('Hybrid')}</Dotted>
                </Tooltip>
            )
        case 'control':
            return (
                <Tooltip
                    content={t(
                        'control nodes run project and inventory updates and system jobs, but not regular jobs. Execution capabilities are disabled on these nodes.'
                    )}
                >
                    <Dotted>{t('Hybrid')}</Dotted>
                </Tooltip>
            )
        case 'execution':
            return (
                <Tooltip
                    content={t(
                        'Execution nodes run jobs under ansible-runner with podman isolation. This node type is similar to isolated nodes. This is the default node type for execution plane nodes.'
                    )}
                >
                    <Dotted>{t('Execution')}</Dotted>
                </Tooltip>
            )
        case 'hop':
            return (
                <Tooltip
                    content={t(
                        'similar to a jump host, hop nodes will route traffic to other execution nodes. Hop nodes cannot execute automation.'
                    )}
                >
                    <Dotted>{t('HOP')}</Dotted>
                </Tooltip>
            )
        default:
            return <>{props.node_type}</>
    }
}
