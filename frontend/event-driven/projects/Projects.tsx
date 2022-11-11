import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { TablePage } from '../../../framework'
import { useInMemoryView } from '../../../framework/useInMemoryView'
import { useGet } from '../../common/useItem'
import { idKeyFn } from '../../hub/usePulpView'
import { RouteE } from '../../Routes'
import { EdaProject } from '../interfaces/EdaProject'
import { useProjectRowActions } from './hooks/useProjectRowActions'
import { useProjectsColumns } from './hooks/useProjectsColumns'
import { useProjectsFilters } from './hooks/useProjectsFilters'
import { useProjectsToolbarActions } from './hooks/useProjectsToolbarActions'

export function Projects() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const toolbarFilters = useProjectsFilters()
  const { data: projects, mutate: refresh } = useGet<EdaProject[]>('/api/projects')
  const tableColumns = useProjectsColumns()
  const view = useInMemoryView<EdaProject>({
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
      titleHelpTitle={t('Projects')}
      titleHelp={t(
        'A Project is a logical collection of Ansible playbooks, represented in Tower. You can manage playbooks and playbook directories by either placing them manually under the Project Base Path on your Tower server, or by placing your playbooks into a source code management (SCM) system supported by Tower, including Git, Subversion, Mercurial, and Red Hat Insights.'
      )}
      titleDocLink="https://docs.ansible.com/ansible-tower/latest/html/userguide/projects.html"
      description={t(
        'A Project is a logical collection of Ansible playbooks, represented in Tower.'
      )}
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
