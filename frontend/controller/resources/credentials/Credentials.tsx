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
import { Credential } from '../../interfaces/Credential'
import { useControllerView } from '../../useControllerView'
import { useDeleteCredentials } from './useDeleteCredentials'

export function Credentials() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const toolbarFilters = useCredentialsFilters()
  const tableColumns = useCredentialsColumns()
  const view = useControllerView<Credential>({
    url: '/api/v2/credentials/',
    toolbarFilters,
    tableColumns,
  })
  const deleteCredentials = useDeleteCredentials(view.unselectItemsAndRefresh)

  const toolbarActions = useMemo<ITypedAction<Credential>[]>(
    () => [
      {
        type: TypedActionType.button,
        variant: ButtonVariant.primary,
        icon: PlusIcon,
        label: t('Create credential'),
        onClick: () => navigate(RouteE.CreateCredential),
      },
      {
        type: TypedActionType.bulk,
        icon: TrashIcon,
        label: t('Delete selected credentials'),
        onClick: deleteCredentials,
      },
    ],
    [navigate, deleteCredentials, t]
  )

  const rowActions = useMemo<ITypedAction<Credential>[]>(
    () => [
      {
        type: TypedActionType.single,
        icon: EditIcon,
        label: t('Edit credential'),
        onClick: (credential) =>
          navigate(RouteE.EditCredential.replace(':id', credential.id.toString())),
      },
      {
        type: TypedActionType.single,
        icon: TrashIcon,
        label: t('Delete credential'),
        onClick: (credential) => deleteCredentials([credential]),
      },
    ],
    [navigate, deleteCredentials, t]
  )

  return (
    <TablePage<Credential>
      title={t('Credentials')}
      titleHelpTitle={t('Credentials')}
      titleHelp={t('credentials.title.help')}
      titleDocLink="https://docs.ansible.com/ansible-tower/latest/html/userguide/credentials.html"
      description={t('credentials.title.description')}
      toolbarFilters={toolbarFilters}
      toolbarActions={toolbarActions}
      tableColumns={tableColumns}
      rowActions={rowActions}
      errorStateTitle={t('Error loading credentials')}
      emptyStateTitle={t('No credentials yet')}
      emptyStateDescription={t('To get started, create an credential.')}
      emptyStateButtonText={t('Create credential')}
      emptyStateButtonClick={() => navigate(RouteE.CreateCredential)}
      {...view}
    />
  )
}

export function useCredentialsFilters() {
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

export function useCredentialsColumns(options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const nameClick = useCallback(
    (credential: Credential) =>
      navigate(RouteE.CredentialDetails.replace(':id', credential.id.toString())),
    [navigate]
  )
  const nameColumn = useNameColumn({
    ...options,
    onClick: nameClick,
  })
  const descriptionColumn = useDescriptionColumn()
  const createdColumn = useCreatedColumn(options)
  const modifiedColumn = useModifiedColumn(options)
  const tableColumns = useMemo<ITableColumn<Credential>[]>(
    () => [
      nameColumn,
      descriptionColumn,
      {
        header: t('Credential type'),
        cell: (credential) => {
          switch (credential.credential_type) {
            case 1:
              return t('Machine')
            case 18:
              return t('Ansible Galaxy/Automation Hub API Token')
          }
          return t('Unknown')
        },
      },
      createdColumn,
      modifiedColumn,
    ],
    [nameColumn, descriptionColumn, t, createdColumn, modifiedColumn]
  )
  return tableColumns
}
