import { EditIcon, TrashIcon } from '@patternfly/react-icons'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ITypedAction, TypedActionType } from '../../../../framework'
import { RouteE } from '../../../Routes'
import { EdaRule } from '../../interfaces/EdaRule'
import { useDeleteRules } from './useDeleteRules'

export function useRuleActions(refresh: () => Promise<unknown>) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const deleteRules = useDeleteRules(() => void refresh())
  return useMemo<ITypedAction<EdaRule>[]>(
    () => [
      {
        type: TypedActionType.single,
        icon: EditIcon,
        label: t('Edit rule'),
        onClick: (rule: EdaRule) => navigate(RouteE.EditEdaRule.replace(':id', rule.id.toString())),
      },
      {
        type: TypedActionType.single,
        icon: TrashIcon,
        label: t('Delete rule'),
        onClick: (rule: EdaRule) => deleteRules([rule]),
      },
    ],
    [deleteRules, navigate, t]
  )
}
