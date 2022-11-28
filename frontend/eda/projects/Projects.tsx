import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { TablePage } from '../../../framework'
import { useInMemoryView } from '../../../framework/useInMemoryView'
import { useGet } from '../../common/useItem'
import { idKeyFn } from '../../hub/usePulpView'
import { RouteE } from '../../Routes'
import { EdaProject } from '../interfaces/EdaProject'
import { useProjectActions } from './hooks/useProjectActions'
import { useProjectColumns } from './hooks/useProjectColumns'
import { useProjectFilters } from './hooks/useProjectFilters'
import { useProjectsActions } from './hooks/useProjectsActions'

export function Projects() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const toolbarFilters = useProjectFilters()
  const { data: projects, mutate: refresh } = useGet<EdaProject[]>('/api/projects')
  const tableColumns = useProjectColumns()
  const view = useInMemoryView<EdaProject>({
    items: projects,
    tableColumns,
    toolbarFilters,
    keyFn: idKeyFn,
  })
  const toolbarActions = useProjectsActions(refresh)
  const rowActions = useProjectActions(refresh)
  return (
    <TablePage
      title={t('Projects')}
      tableColumns={tableColumns}
      toolbarActions={toolbarActions}
      toolbarFilters={toolbarFilters}
      rowActions={rowActions}
      errorStateTitle={t('Error loading projects')}
      emptyStateTitle={t('No projects yet')}
      emptyStateDescription={t('To get started, create a project.')}
      emptyStateButtonText={t('Create project')}
      emptyStateButtonClick={() => navigate(RouteE.CreateEdaProject)}
      {...view}
      defaultSubtitle={t('Project')}
    />
  )
}
