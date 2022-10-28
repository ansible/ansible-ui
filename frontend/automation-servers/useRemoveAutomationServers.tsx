import { useTranslation } from 'react-i18next'
import { BulkActionDialog, compareStrings, usePageDialog } from '../../framework'
import { AutomationServer, automationServerKeyFn } from './AutomationServer'
import { useAutomationServers } from './AutomationServerProvider'
import { useAutomationServersColumns } from './AutomationServersPage'

export function useRemoveAutomationServers() {
  const { t } = useTranslation()
  const [_, setDialog] = usePageDialog()
  const a = useAutomationServers()
  const columns = useAutomationServersColumns({ disableLinks: true, disableSort: true })
  const removeAutomationServers = (items: AutomationServer[]) => {
    setDialog(
      <BulkActionDialog<AutomationServer>
        title={t('Remove automation servers', { count: items.length })}
        confirmText={t('Yes, I confirm that I want to delete these {{count}} automation servers.', {
          count: items.length,
        })}
        submitText={t('Delete automation servers', { count: items.length })}
        submitting={t('Deleting automation servers', { count: items.length })}
        submittingTitle={t('Deleting {{count}} automation servers', { count: items.length })}
        error={t('There were errors deleting automation servers', { count: items.length })}
        items={items.sort((l, r) => compareStrings(l.name, r.name))}
        keyFn={automationServerKeyFn}
        columns={columns}
        errorColumns={columns}
        action={(automationServer: AutomationServer) => {
          a.setAutomationServers(a.automationServers.filter((a) => a !== automationServer))
          return Promise.resolve()
        }}
      />
    )
  }
  return removeAutomationServers
}
