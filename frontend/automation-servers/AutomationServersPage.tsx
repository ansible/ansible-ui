import { ButtonVariant } from '@patternfly/react-core'
import { EditIcon, MinusCircleIcon, PlusCircleIcon } from '@patternfly/react-icons'
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

export function AutomationServersPage() {
  const { t } = useTranslation()
  // const navigate = useNavigate()

  const tableColumns = useAutomationServersColumns()
  const { automationServers } = useAutomationServers()
  const view = useView()
  const selected = useSelected(automationServers, automationServerKeyFn)

  const addAutomationServer = useAddAutomationServer()

  const toolbarActions = useMemo<ITypedAction<AutomationServer>[]>(
    () => [
      {
        type: TypedActionType.button,
        variant: ButtonVariant.primary,
        icon: PlusCircleIcon,
        label: t('Add automation server'),
        onClick: () => addAutomationServer(),
      },
      { type: TypedActionType.seperator },
      {
        type: TypedActionType.bulk,
        icon: MinusCircleIcon,
        label: t('Remove selected automation servers'),
        onClick: () => null,
      },
    ],
    [addAutomationServer, t]
  )

  const rowActions = useMemo<ITypedAction<AutomationServer>[]>(
    () => [
      {
        type: TypedActionType.single,
        variant: ButtonVariant.primary,
        icon: EditIcon,
        label: t('Edit automation server'),
        onClick: () => null,
      },
      { type: TypedActionType.seperator },
      {
        type: TypedActionType.single,
        icon: MinusCircleIcon,
        label: t('Remove automation server'),
        onClick: () => null,
      },
    ],
    [t]
  )

  return (
    <PageLayout>
      <PageHeader
        title={t('Automation Servers')}
        description={t(
          'The Ansible Automation Platform is comprised of automation controllers and automation hubs.'
        )}
        titleHelpTitle="Automation Server"
        titleHelp={[
          t(
            'The Ansible Automation Platform is made up of automation controllers and automation hubs.'
          ),
          t(
            'Automation controller enables you to define, operate, scale, and delegate automation across your enterprise.'
          ),
          t(
            'Automation hub enables you to discover, publish, and manage your Ansible Collections.'
          ),
        ]}
      />
      <PageBody>
        <PageTable<AutomationServer>
          toolbarActions={toolbarActions}
          tableColumns={tableColumns}
          rowActions={rowActions}
          errorStateTitle={t('Error loading automation servers')}
          emptyStateTitle={t('No automation servers yet')}
          emptyStateDescription={t('To get started, create a automation server.')}
          emptyStateButtonText={t('Create automationServer')}
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
