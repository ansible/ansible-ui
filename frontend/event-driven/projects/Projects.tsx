import { ButtonVariant } from '@patternfly/react-core'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ITableColumn,
  ITypedAction,
  TablePage,
  TextCell,
  TypedActionType,
} from '../../../framework'
import { useEdaView } from '../useEventDrivenView'
import { useDeleteProjects } from './hook/useDeleteProjects'
import { Project } from './Project'

export function Projects() {
  const { t } = useTranslation()
  const tableColumns = useProjectsColumns()
  const view = useEdaView<Project>({ url: '/api/projects', tableColumns })
  const deleteProjects = useDeleteProjects(view.unselectItemsAndRefresh)
  const toolbarActions = useMemo<ITypedAction<Project>[]>(
    () => [
      {
        type: TypedActionType.button,
        variant: ButtonVariant.primary,
        label: 'Create project',
        onClick: () => alert('TODO'),
      },
      {
        type: TypedActionType.bulk,
        label: 'Delete selected projects',
        onClick: (projects: Project[]) => deleteProjects(projects),
      },
    ],
    [deleteProjects]
  )
  const rowActions = useMemo<ITypedAction<Project>[]>(
    () => [
      {
        type: TypedActionType.single,
        label: 'Delete project',
        onClick: (project: Project) => deleteProjects([project]),
      },
    ],
    [deleteProjects]
  )
  return (
    <TablePage
      title={t('Projects')}
      tableColumns={tableColumns}
      toolbarActions={toolbarActions}
      rowActions={rowActions}
      errorStateTitle={t('Error loading projects')}
      emptyStateTitle={t('No projects yet')}
      emptyStateDescription={t('To get started, create a project.')}
      emptyStateButtonText={t('Create project')}
      // emptyStateButtonClick={() => navigate(RouteE.CreateProject)}
      {...view}
    />
  )
}

export function useProjectsColumns() {
  const { t } = useTranslation()
  const tableColumns = useMemo<ITableColumn<Project>[]>(
    () => [
      { header: t('Name'), cell: (project) => <TextCell text={project.name} /> },
      { header: t('Url'), cell: (project) => <TextCell text={project.url} /> },
    ],
    [t]
  )
  return tableColumns
}
