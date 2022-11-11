import { ButtonVariant } from '@patternfly/react-core'
import { PlusIcon, TrashIcon } from '@patternfly/react-icons'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ITypedAction, TypedActionType } from '../../../../framework'
import { RouteE } from '../../../Routes'
import { Project } from '../../interfaces/Project'
import { useDeleteProjects } from './useDeleteProjects'

export function useProjectsToolbarActions(refresh: () => Promise<unknown>) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const deleteProjects = useDeleteProjects(() => void refresh())
  const toolbarActions = useMemo<ITypedAction<Project>[]>(
    () => [
      {
        type: TypedActionType.button,
        variant: ButtonVariant.primary,
        icon: PlusIcon,
        label: t('Create project'),
        onClick: () => navigate(RouteE.CreateEdaProject),
      },
      {
        type: TypedActionType.bulk,
        icon: TrashIcon,
        label: t('Delete selected projects'),
        onClick: (projects: Project[]) => deleteProjects(projects),
      },
    ],
    [deleteProjects, navigate, t]
  )
  return toolbarActions
}
