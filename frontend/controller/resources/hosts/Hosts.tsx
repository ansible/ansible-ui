import { ButtonVariant } from '@patternfly/react-core'
import { EditIcon, PlusIcon, TrashIcon } from '@patternfly/react-icons'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  ITableColumn,
  IToolbarFilter,
  ITypedAction,
  TablePage,
  TypedActionType,
} from '../../../../framework'
import {
  useCreatedColumn,
  useDescriptionColumn,
  useModifiedColumn,
  useNameColumn,
} from '../../../common/columns'
import { RouteE } from '../../../Routes'
import {
  useCreatedByToolbarFilter,
  useDescriptionToolbarFilter,
  useModifiedByToolbarFilter,
  useNameToolbarFilter,
} from '../../common/controller-toolbar-filters'
import { useControllerView } from '../../useControllerView'
import { Host } from './Host'
import { useDeleteHosts } from './useDeleteHosts'

export function Hosts() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const toolbarFilters = useHostsFilters()
  const tableColumns = useHostsColumns()
  const view = useControllerView<Host>({ url: '/api/v2/hosts/', toolbarFilters, tableColumns })
  const deleteHosts = useDeleteHosts(view.unselectItemsAndRefresh)

  const toolbarActions = useMemo<ITypedAction<Host>[]>(
    () => [
      {
        type: TypedActionType.button,
        variant: ButtonVariant.primary,
        icon: PlusIcon,
        label: t('Create host'),
        onClick: () => navigate(RouteE.CreateHost),
      },
      {
        type: TypedActionType.bulk,
        icon: TrashIcon,
        label: t('Delete selected hosts'),
        onClick: deleteHosts,
      },
    ],
    [navigate, deleteHosts, t]
  )

  const rowActions = useMemo<ITypedAction<Host>[]>(
    () => [
      {
        type: TypedActionType.single,
        icon: EditIcon,
        label: t('Edit host'),
        onClick: (host) => navigate(RouteE.EditHost.replace(':id', host.id.toString())),
      },
      {
        type: TypedActionType.single,
        icon: TrashIcon,
        label: t('Delete host'),
        onClick: (host) => deleteHosts([host]),
      },
    ],
    [navigate, deleteHosts, t]
  )

  return (
    <TablePage<Host>
      title={t('Hosts')}
      description={t(
        'A system managed by Ansible, which may include a physical, virtual, cloud-based server, or other device.'
      )}
      titleHelpTitle={t('Hosts')}
      titleHelp={[
        t(
          'A system managed by Tower, which may include a physical, virtual, cloud-based server, or other device. Typically an operating system instance. Hosts are contained in Inventory. Sometimes referred to as a “node”.'
        ),
        t(
          'Ansible works against multiple managed nodes or “hosts” in your infrastructure at the same time, using a list or group of lists known as inventory. Once your inventory is defined, you use patterns to select the hosts or groups you want Ansible to run against.'
        ),
      ]}
      titleDocLink="https://docs.ansible.com/ansible-tower/latest/html/userguide/hosts.html"
      toolbarFilters={toolbarFilters}
      toolbarActions={toolbarActions}
      tableColumns={tableColumns}
      rowActions={rowActions}
      errorStateTitle={t('Error loading hosts')}
      emptyStateTitle={t('No hosts yet')}
      emptyStateDescription={t('To get started, create an host.')}
      emptyStateButtonText={t('Create host')}
      emptyStateButtonClick={() => navigate(RouteE.CreateHost)}
      {...view}
    />
  )
}

export function useHostsFilters() {
  const nameToolbarFilter = useNameToolbarFilter()
  const descriptionToolbarFilter = useDescriptionToolbarFilter()
  const createdByToolbarFilter = useCreatedByToolbarFilter()
  const modifiedByToolbarFilter = useModifiedByToolbarFilter()
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      nameToolbarFilter,
      descriptionToolbarFilter,
      createdByToolbarFilter,
      modifiedByToolbarFilter,
    ],
    [nameToolbarFilter, descriptionToolbarFilter, createdByToolbarFilter, modifiedByToolbarFilter]
  )
  return toolbarFilters
}

export function useHostsColumns(options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const navigate = useNavigate()
  const nameClick = useCallback(
    (host: Host) => navigate(RouteE.HostDetails.replace(':id', host.id.toString())),
    [navigate]
  )
  const nameColumn = useNameColumn({
    ...options,
    onClick: nameClick,
  })
  const descriptionColumn = useDescriptionColumn()
  const createdColumn = useCreatedColumn(options)
  const modifiedColumn = useModifiedColumn(options)
  const tableColumns = useMemo<ITableColumn<Host>[]>(
    () => [nameColumn, descriptionColumn, createdColumn, modifiedColumn],
    [nameColumn, descriptionColumn, createdColumn, modifiedColumn]
  )
  return tableColumns
}
