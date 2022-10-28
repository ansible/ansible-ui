import { ButtonVariant } from '@patternfly/react-core'
import { MinusCircleIcon, PlusCircleIcon } from '@patternfly/react-icons'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  ITableColumn,
  ITypedAction,
  PageBody,
  PageHeader,
  PageLayout,
  PageTable,
  TextCell,
  TypedActionType,
  useSelected,
} from '../../framework'
import { useView } from '../../framework/useView'
import { RouteE } from '../Routes'
import { AutomationServer, automationServerKeyFn } from './AutomationServer'
import { useAutomationServers } from './AutomationServerProvider'
import { useAddAutomationServer } from './useAddAutomationServer'
import { useRemoveAutomationServers } from './useRemoveAutomationServers'

export function AutomationServersPage() {
  const { t } = useTranslation()
  // const navigate = useNavigate()

  const tableColumns = useAutomationServersColumns()
  const { automationServers } = useAutomationServers()
  const view = useView()
  const selected = useSelected(automationServers, automationServerKeyFn)

  const addAutomationServer = useAddAutomationServer()
  const removeAutomationServers = useRemoveAutomationServers()

  const toolbarActions = useMemo<ITypedAction<AutomationServer>[]>(
    () => [
      {
        type: TypedActionType.button,
        variant: ButtonVariant.primary,
        icon: PlusCircleIcon,
        label: t('Add automation server'),
        onClick: addAutomationServer,
      },
    ],
    [addAutomationServer, t]
  )

  const rowActions = useMemo<ITypedAction<AutomationServer>[]>(
    () => [
      // {
      //   type: TypedActionType.single,
      //   variant: ButtonVariant.primary,
      //   icon: EditIcon,
      //   label: t('Edit automation server'),
      //   onClick: () => null,
      // },
      // { type: TypedActionType.seperator },
      {
        type: TypedActionType.single,
        icon: MinusCircleIcon,
        label: t('Remove automation server'),
        onClick: (server) => removeAutomationServers([server]),
      },
    ],
    [removeAutomationServers, t]
  )

  return (
    <PageLayout>
      {automationServers.length > 0 && <PageHeader title={t('Automation servers')} />}
      <PageBody>
        <PageTable<AutomationServer>
          toolbarActions={toolbarActions}
          tableColumns={tableColumns}
          rowActions={rowActions}
          errorStateTitle={t('Error loading automation servers')}
          emptyStateTitle={t('Welcome to the ansible automation platform')}
          emptyStateDescription={t('To get started, add an automation server.')}
          emptyStateButtonText={t('Add automation server')}
          emptyStateButtonClick={addAutomationServer}
          {...view}
          pageItems={automationServers}
          itemCount={automationServers.length}
          {...selected}
        />
      </PageBody>
    </PageLayout>
  )
}

export function useAutomationServersColumns(_options?: {
  disableLinks?: boolean
  disableSort?: boolean
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const tableColumns = useMemo<ITableColumn<AutomationServer>[]>(
    () => [
      {
        header: t('Name'),
        cell: (server) => (
          <TextCell
            text={server.name}
            onClick={() => navigate(RouteE.Login + '?server=' + encodeURIComponent(server.url))}
          />
        ),
      },
      {
        header: t('Type'),
        cell: (server) => {
          switch (server.type) {
            case 'controller':
              return <TextCell text="Controller" />
            case 'hub':
              return <TextCell text="Hub" />
            default:
              return <TextCell text="Unknown" />
          }
        },
      },
      { header: t('Url'), cell: (server) => server.url },
    ],
    [navigate, t]
  )
  return tableColumns
}
