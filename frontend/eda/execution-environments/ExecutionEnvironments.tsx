import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { TablePage } from '../../../framework'
import { useInMemoryView } from '../../../framework/useInMemoryView'
import { useGet } from '../../common/useItem'
import { idKeyFn } from '../../hub/usePulpView'
import { RouteE } from '../../Routes'
import { EdaExecutionEnvironment } from '../interfaces/EdaExecutionEnvironment'
import { useExecutionEnvironmentActions } from './hooks/useExecutionEnvironmentActions'
import { useExecutionEnvironmentColumns } from './hooks/useExecutionEnvironmentColumns'
import { useExecutionEnvironmentFilters } from './hooks/useExecutionEnvironmentFilters'
import { useExecutionEnvironmentsActions } from './hooks/useExecutionEnvironmentsActions'

export function ExecutionEnvironments() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const toolbarFilters = useExecutionEnvironmentFilters()
  const { data: executionEnvironments, mutate: refresh } = useGet<EdaExecutionEnvironment[]>(
    '/api/executionEnvironments'
  )
  const tableColumns = useExecutionEnvironmentColumns()
  const view = useInMemoryView<EdaExecutionEnvironment>({
    items: executionEnvironments,
    tableColumns,
    toolbarFilters,
    keyFn: idKeyFn,
  })
  const toolbarActions = useExecutionEnvironmentsActions(refresh)
  const rowActions = useExecutionEnvironmentActions(refresh)
  return (
    <TablePage
      title={t('ExecutionEnvironments')}
      tableColumns={tableColumns}
      toolbarActions={toolbarActions}
      toolbarFilters={toolbarFilters}
      rowActions={rowActions}
      errorStateTitle={t('Error loading executionEnvironments')}
      emptyStateTitle={t('No executionEnvironments yet')}
      emptyStateDescription={t('To get started, create a executionEnvironment.')}
      emptyStateButtonText={t('Create executionEnvironment')}
      emptyStateButtonClick={() => navigate(RouteE.CreateEdaExecutionEnvironment)}
      {...view}
    />
  )
}
