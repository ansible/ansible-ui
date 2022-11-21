import { ButtonVariant } from '@patternfly/react-core'
import { ThumbsDownIcon, ThumbsUpIcon } from '@patternfly/react-icons'
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
} from '../../../../framework'
import { idKeyFn, useHubView } from '../../useHubView'
import { Approval } from './Approval'

export function Approvals() {
  const { t } = useTranslation()
  const toolbarFilters = useApprovalFilters()
  const tableColumns = useApprovalsColumns()
  const view = useHubView<Approval>(
    '/api/automation-hub/_ui/v1/collection-versions/',
    idKeyFn,
    toolbarFilters,
    tableColumns
  )
  const toolbarActions = useMemo<ITypedAction<Approval>[]>(
    () => [
      {
        type: TypedActionType.bulk,
        variant: ButtonVariant.primary,
        icon: ThumbsUpIcon,
        label: t('Approve collections'),
        onClick: () => {
          /**/
        },
      },
      {
        type: TypedActionType.bulk,
        icon: ThumbsDownIcon,
        label: t('Deny collections'),
        onClick: () => {
          /**/
        },
      },
    ],
    [t]
  )
  const rowActions = useMemo<ITypedAction<Approval>[]>(
    () => [
      {
        type: TypedActionType.single,
        variant: ButtonVariant.primary,
        icon: ThumbsUpIcon,
        label: t('Approve'),
        onClick: () => {
          /**/
        },
      },
      {
        type: TypedActionType.single,
        variant: ButtonVariant.primary,
        icon: ThumbsDownIcon,
        label: t('Reject'),
        onClick: () => {
          /**/
        },
      },
    ],
    [t]
  )
  return (
    <TablePage<Approval>
      title={t('Collection approvals')}
      toolbarFilters={toolbarFilters}
      tableColumns={tableColumns}
      toolbarActions={toolbarActions}
      rowActions={rowActions}
      errorStateTitle={t('Error loading approvals')}
      emptyStateTitle={t('No approvals yet')}
      {...view}
    />
  )
}

export function useApprovalsColumns(_options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const { t } = useTranslation()
  const tableColumns = useMemo<ITableColumn<Approval>[]>(
    () => [
      { header: t('Namespace'), cell: (approval) => <TextCell text={approval.namespace} /> },
      { header: t('Collection'), cell: (approval) => <TextCell text={approval.name} /> },
      { header: t('Version'), cell: (approval) => <TextCell text={approval.version} /> },
      { header: t('Created'), cell: (approval) => <SinceCell value={approval.created_at} /> },
    ],
    [t]
  )
  return tableColumns
}

export function useApprovalFilters() {
  const { t } = useTranslation()
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      { key: 'namespace', label: t('Namespace'), type: 'string', query: 'namespace' },
      { key: 'collection', label: t('Collection'), type: 'string', query: 'colleciton' },
      { key: 'status', label: t('Status'), type: 'string', query: 'respository' },
    ],
    [t]
  )
  return toolbarFilters
}
