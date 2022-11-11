import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { TablePage } from '../../../framework'
import { useInMemoryView } from '../../../framework/useInMemoryView'
import { useGet } from '../../common/useItem'
import { idKeyFn } from '../../hub/usePulpView'
import { RouteE } from '../../Routes'
import { Project } from '../interfaces/Project'
import { useProjectRowActions } from './hooks/useProjectRowActions'
import { useProjectsColumns } from './hooks/useProjectsColumns'
import { useProjectsFilters } from './hooks/useProjectsFilters'
import { useProjectsToolbarActions } from './hooks/useProjectsToolbarActions'

export function Projects() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const toolbarFilters = useProjectsFilters()
  const { data: projects, mutate: refresh } = useGet<Project[]>('/api/projects')
  const tableColumns = useProjectsColumns()
  const view = useInMemoryView<Project>({
    items: projects,
    tableColumns,
    toolbarFilters,
    keyFn: idKeyFn,
  })
  const toolbarActions = useProjectsToolbarActions(refresh)
  const rowActions = useProjectRowActions(refresh)
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
    />
  )
}
