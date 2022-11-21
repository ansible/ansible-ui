import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { TablePage } from '../../../framework'
import { useInMemoryView } from '../../../framework/useInMemoryView'
import { useGet } from '../../common/useItem'
import { idKeyFn } from '../../hub/usePulpView'
import { RouteE } from '../../Routes'
import { EdaRule } from '../interfaces/EdaRule'
import { useRuleActions } from './hooks/useRuleActions'
import { useRuleColumns } from './hooks/useRuleColumns'
import { useRuleFilters } from './hooks/useRuleFilters'
import { useRulesActions } from './hooks/useRulesActions'

export function Rules() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const toolbarFilters = useRuleFilters()
  const { data: rules, mutate: refresh } = useGet<EdaRule[]>('/api/rules')
  const tableColumns = useRuleColumns()
  const view = useInMemoryView<EdaRule>({
    items: rules,
    tableColumns,
    toolbarFilters,
    keyFn: idKeyFn,
  })
  const toolbarActions = useRulesActions(refresh)
  const rowActions = useRuleActions(refresh)
  return (
    <TablePage
      title={t('Rules')}
      tableColumns={tableColumns}
      toolbarActions={toolbarActions}
      toolbarFilters={toolbarFilters}
      rowActions={rowActions}
      errorStateTitle={t('Error loading rules')}
      emptyStateTitle={t('No rules yet')}
      emptyStateDescription={t('To get started, create a rule.')}
      emptyStateButtonText={t('Create rule')}
      emptyStateButtonClick={() => navigate(RouteE.CreateEdaRule)}
      {...view}
    />
  )
}
