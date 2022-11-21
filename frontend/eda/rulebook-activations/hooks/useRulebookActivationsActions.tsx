import { ButtonVariant } from '@patternfly/react-core'
import { PlusIcon, TrashIcon } from '@patternfly/react-icons'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ITypedAction, TypedActionType } from '../../../../framework'
import { RouteE } from '../../../Routes'
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation'
import { useDeleteRulebookActivations } from './useDeleteRulebookActivations'

export function useRulebookActivationsActions(refresh: () => Promise<unknown>) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const deleteRulebookActivations = useDeleteRulebookActivations(() => void refresh())
  return useMemo<ITypedAction<EdaRulebookActivation>[]>(
    () => [
      {
        type: TypedActionType.button,
        variant: ButtonVariant.primary,
        icon: PlusIcon,
        label: t('Create rulebookActivation'),
        onClick: () => navigate(RouteE.CreateEdaRulebookActivation),
      },
      {
        type: TypedActionType.bulk,
        icon: TrashIcon,
        label: t('Delete selected rulebookActivations'),
        onClick: (rulebookActivations: EdaRulebookActivation[]) =>
          deleteRulebookActivations(rulebookActivations),
      },
    ],
    [deleteRulebookActivations, navigate, t]
  )
}
