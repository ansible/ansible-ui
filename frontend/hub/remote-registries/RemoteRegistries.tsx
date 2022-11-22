import { ButtonVariant } from '@patternfly/react-core'
import { EditIcon, PlusIcon } from '@patternfly/react-icons'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ITableColumn,
  IToolbarFilter,
  ITypedAction,
  SinceCell,
  TablePage,
  TextCell,
  TypedActionType,
} from '../../../framework'
import { pkKeyFn, useHubView } from '../useHubView'
import { RemoteRegistry } from './RemoteRegistry'

export function RemoteRegistries() {
  const { t } = useTranslation()
  const toolbarFilters = useRemoteRegistryFilters()
  const tableColumns = useRemoteRegistriesColumns()
  const view = useHubView<RemoteRegistry>(
    '/api/automation-hub/_ui/v1/execution-environments/registries/',
    pkKeyFn,
    toolbarFilters,
    tableColumns
  )
  const toolbarActions = useMemo<ITypedAction<RemoteRegistry>[]>(
    () => [
      {
        type: TypedActionType.button,
        variant: ButtonVariant.primary,
        icon: PlusIcon,
        label: t('Add remote registry'),
        onClick: () => {
          /**/
        },
      },
    ],
    [t]
  )
  const rowActions = useMemo<ITypedAction<RemoteRegistry>[]>(
    () => [
      {
        type: TypedActionType.single,
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
    <TablePage<RemoteRegistry>
      title={t('Remote registries')}
      toolbarFilters={toolbarFilters}
      tableColumns={tableColumns}
      toolbarActions={toolbarActions}
      rowActions={rowActions}
      errorStateTitle={t('Error loading remote registries')}
      emptyStateTitle={t('No remote registries yet')}
      {...view}
    />
  )
}

export function useRemoteRegistriesColumns(_options?: {
  disableSort?: boolean
  disableLinks?: boolean
}) {
  const { t } = useTranslation()
  const tableColumns = useMemo<ITableColumn<RemoteRegistry>[]>(
    () => [
      {
        header: t('Name'),
        cell: (remoteRegistry) => <TextCell text={remoteRegistry.name} />,
      },
      {
        header: t('Created'),
        cell: (remoteRegistry) => <SinceCell value={remoteRegistry.created_at} />,
      },
      {
        header: t('Registry URL'),
        cell: (remoteRegistry) => <TextCell text={remoteRegistry.url} />,
      },
    ],
    [t]
  )
  return tableColumns
}

export function useRemoteRegistryFilters() {
  const { t } = useTranslation()
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [{ key: 'name', label: t('Name'), type: 'string', query: 'name' }],
    [t]
  )
  return toolbarFilters
}
