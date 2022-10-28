import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  ITableColumn,
  PageBody,
  PageHeader,
  PageLayout,
  PageTable,
  TextCell,
} from '../../framework'
import { useView } from '../../framework/useView'
import { RouteE } from '../Routes'
import { AutomationServer, automationServerKeyFn } from './AutomationServer'
import { useAutomationServers } from './AutomationServerProvider'

export function AutomationServersPage() {
  const { t } = useTranslation()
  // const navigate = useNavigate()

  const tableColumns = useAutomationServersColumns()
  const { automationServers } = useAutomationServers()
  const view = useView()

  return (
    <PageLayout>
      <PageHeader title={t('Automation Servers')} />
      <PageBody>
        <PageTable<AutomationServer>
          tableColumns={tableColumns}
          errorStateTitle={t('Error loading automation servers')}
          emptyStateTitle={t('No automation servers yet')}
          emptyStateDescription={t('To get started, create a automation server.')}
          emptyStateButtonText={t('Create automationServer')}
          {...view}
          pageItems={automationServers}
          itemCount={automationServers.length}
          keyFn={automationServerKeyFn}
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
      { header: t('Type'), cell: (server) => server.type },
      { header: t('Url'), cell: (server) => server.url },
    ],
    [t]
  )
  return tableColumns
}
