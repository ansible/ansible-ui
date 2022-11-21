import { EditIcon, TrashIcon } from '@patternfly/react-icons'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ITypedAction, TypedActionType } from '../../../../framework'
import { RouteE } from '../../../Routes'
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation'
import { useDeleteRulebookActivations } from './useDeleteRulebookActivations'

export function useRulebookActivationActions(refresh: () => Promise<unknown>) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const deleteRulebookActivations = useDeleteRulebookActivations(() => void refresh())
  return useMemo<ITypedAction<EdaRulebookActivation>[]>(
    () => [
      {
        type: TypedActionType.single,
        icon: EditIcon,
        label: t('Edit rulebookActivation'),
        onClick: (rulebookActivation: EdaRulebookActivation) =>
          navigate(
            RouteE.EditEdaRulebookActivation.replace(':id', rulebookActivation.id.toString())
          ),
      },
      {
        type: TypedActionType.single,
        icon: TrashIcon,
        label: t('Delete rulebookActivation'),
        onClick: (rulebookActivation: EdaRulebookActivation) =>
          deleteRulebookActivations([rulebookActivation]),
      },
    ],
    [deleteRulebookActivations, navigate, t]
  )
}
