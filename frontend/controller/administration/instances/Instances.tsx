import { ButtonVariant, Tooltip } from '@patternfly/react-core'
import { EditIcon, HeartbeatIcon } from '@patternfly/react-icons'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  BytesCell,
  CapacityCell,
  ITableColumn,
  IToolbarFilter,
  ITypedAction,
  SinceCell,
  TablePage,
  TextCell,
  TypedActionType,
} from '../../../../framework'
import { Dotted } from '../../../../framework/components/Dotted'
import { AlertToasterProps, usePageAlertToaster } from '../../../../framework/PageAlertToaster'
import { useCreatedColumn, useModifiedColumn } from '../../../common/columns'
import { StatusCell } from '../../../common/StatusCell'
import { requestPost } from '../../../Data'
import { RouteE } from '../../../Routes'
import { Instance } from '../../interfaces/Instance'
import { useControllerView } from '../../useControllerView'

export function Instances() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const toolbarFilters = useInstancesFilters()
  const tableColumns = useInstancesColumns()
  const view = useControllerView<Instance>({
    url: '/api/v2/instances/',
    toolbarFilters,
    tableColumns,
  })

  const alertToaster = usePageAlertToaster()

  const toolbarActions = useMemo<ITypedAction<Instance>[]>(
    () => [
      {
        type: TypedActionType.bulk,
        variant: ButtonVariant.primary,
        icon: HeartbeatIcon,
        label: t('Run health check'),
        onClick: (instances) => {
          for (const instance of instances) {
            requestPost(`/api/v2/instances/${instance.id}/health_check/`, {})
              .then(() => void view.refresh())
              .catch(
                // eslint-disable-next-line no-console
                console.error
              )
          }
        },
      },
    ],
    [t, view]
  )

  const rowActions = useMemo<ITypedAction<Instance>[]>(
    () => [
      {
        type: TypedActionType.single,
        variant: ButtonVariant.secondary,
        icon: HeartbeatIcon,
        label: t('Run health check'),
        onClick: (instance) => {
          const alert: AlertToasterProps = {
            variant: 'info',
            title: t('Health check running'),
          }
          alertToaster.addAlert(alert)
          void requestPost(`/api/v2/instances/${instance.id}/health_check/`, {})
            .catch((err) => {
              alertToaster.replaceAlert(alert, {
                variant: 'danger',
                title: t('Health check failed'),
                children: err instanceof Error && err.message,
              })
            })
            .then(() => {
              void view.refresh()
              alertToaster.replaceAlert(alert, {
                variant: 'success',
                title: t('Health check success'),
                timeout: 2000,
              })
            })
        },
      },
      {
        type: TypedActionType.single,
        icon: EditIcon,
        label: t('Edit instance'),
        onClick: (instance) => navigate(RouteE.EditInstance.replace(':id', instance.id.toString())),
      },
    ],
    [alertToaster, navigate, t, view]
  )

  return (
    <TablePage<Instance>
      title={t('Node instances')}
      description={t(
        'Ansible node instances dedicated for a particular purpose indicated by node type.'
      )}
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
      {
        key: 'name',
        label: t('Name'),
        type: 'string',
        query: 'hostname__icontains',
        placeholder: t('Enter name'),
      },
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
        cell: (instance) => (
          <StatusCell
            status={!instance.enabled ? 'disabled' : instance.errors ? 'error' : 'healthy'}
          />
        ),
        sort: 'errors',
        hideLabel: true,
      },
      {
        header: t('Node type'),
        cell: (instance) => <NodeTypeCell node_type={instance.node_type} />,
        sort: 'node_type',
        card: 'description',
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
        cell: (instance) =>
          instance.capacity && (
            <CapacityCell used={instance.consumed_capacity} capacity={instance.capacity} />
          ),
        list: 'secondary',
      },
      {
        header: t('Memory'),
        cell: (instance) => instance.memory && <BytesCell bytes={instance.memory} />,
        sort: 'memory',
        list: 'secondary',
      },
      {
        header: t('Policy type'),
        cell: (instance) => (instance.managed_by_policy ? t('Auto') : t('Manual')),
      },
      {
        header: t('Last health check'),
        cell: (instance) => <SinceCell value={instance.last_health_check} />,
        card: 'hidden',
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
          <Dotted>{t('Hybrid node')}</Dotted>
        </Tooltip>
      )
    case 'control':
      return (
        <Tooltip
          content={t(
            'control nodes run project and inventory updates and system jobs, but not regular jobs. Execution capabilities are disabled on these nodes.'
          )}
        >
          <Dotted>{t('Control node')}</Dotted>
        </Tooltip>
      )
    case 'execution':
      return (
        <Tooltip
          content={t(
            'Execution nodes run jobs under ansible-runner with podman isolation. This node type is similar to isolated nodes. This is the default node type for execution plane nodes.'
          )}
        >
          <Dotted>{t('Execution node')}</Dotted>
        </Tooltip>
      )
    case 'hop':
      return (
        <Tooltip
          content={t(
            'similar to a jump host, hop nodes will route traffic to other execution nodes. Hop nodes cannot execute automation.'
          )}
        >
          <Dotted>{t('HOP node')}</Dotted>
        </Tooltip>
      )
    default:
      return <>{props.node_type}</>
  }
}
