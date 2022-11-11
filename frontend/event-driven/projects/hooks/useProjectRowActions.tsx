import { EditIcon, TrashIcon } from '@patternfly/react-icons'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ITypedAction, TypedActionType } from '../../../../framework'
import { RouteE } from '../../../Routes'
import { Project } from '../../interfaces/Project'
import { useDeleteProjects } from '../hooks/useDeleteProjects'

export function useProjectRowActions(refresh: () => Promise<unknown>) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const deleteProjects = useDeleteProjects(() => void refresh())
  const rowActions = useMemo<ITypedAction<Project>[]>(
    () => [
      {
        type: TypedActionType.single,
        icon: EditIcon,
        label: t('Edit project'),
        onClick: (project: Project) =>
          navigate(RouteE.EditEdaProject.replace(':id', project.id.toString())),
      },
      {
        type: TypedActionType.single,
        icon: TrashIcon,
        label: t('Delete project'),
        onClick: (project: Project) => deleteProjects([project]),
      },
    ],
    [deleteProjects, navigate, t]
  )
  return rowActions
}
