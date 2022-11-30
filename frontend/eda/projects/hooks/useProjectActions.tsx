import { EditIcon, TrashIcon } from '@patternfly/react-icons'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { IPageAction, PageActionType } from '../../../../framework'
import { RouteE } from '../../../Routes'
import { EdaProject } from '../../interfaces/EdaProject'
import { useDeleteProjects } from './useDeleteProjects'

export function useProjectActions(refresh: () => Promise<unknown>) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const deleteProjects = useDeleteProjects(() => void refresh())
  return useMemo<IPageAction<EdaProject>[]>(
    () => [
      {
        type: PageActionType.single,
        icon: EditIcon,
        label: t('Edit project'),
        onClick: (project: EdaProject) =>
          navigate(RouteE.EditEdaProject.replace(':id', project.id.toString())),
      },
      {
        type: PageActionType.single,
        icon: TrashIcon,
        label: t('Delete project'),
        onClick: (project: EdaProject) => deleteProjects([project]),
      },
    ],
    [deleteProjects, navigate, t]
  )
}
