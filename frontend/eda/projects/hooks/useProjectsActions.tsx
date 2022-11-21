import { ButtonVariant } from '@patternfly/react-core'
import { PlusIcon, TrashIcon } from '@patternfly/react-icons'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ITypedAction, TypedActionType } from '../../../../framework'
import { RouteE } from '../../../Routes'
import { EdaProject } from '../../interfaces/EdaProject'
import { useDeleteProjects } from './useDeleteProjects'

export function useProjectsActions(refresh: () => Promise<unknown>) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const deleteProjects = useDeleteProjects(() => void refresh())
  return useMemo<ITypedAction<EdaProject>[]>(
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
        onClick: (projects: EdaProject[]) => deleteProjects(projects),
      },
    ],
    [deleteProjects, navigate, t]
  )
}
