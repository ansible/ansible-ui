import { EditIcon, TrashIcon } from '@patternfly/react-icons'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { IPageAction, PageActionType } from '../../../../framework'
import { RouteE } from '../../../Routes'
import { EdaRule } from '../../interfaces/EdaRule'
import { useDeleteRules } from './useDeleteRules'

export function useRuleActions(refresh: () => Promise<unknown>) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const deleteRules = useDeleteRules(() => void refresh())
  return useMemo<IPageAction<EdaRule>[]>(
    () => [
      {
        type: PageActionType.single,
        icon: EditIcon,
        label: t('Edit rule'),
        onClick: (rule: EdaRule) => navigate(RouteE.EditEdaRule.replace(':id', rule.id.toString())),
      },
      {
        type: PageActionType.single,
        icon: TrashIcon,
        label: t('Delete rule'),
        onClick: (rule: EdaRule) => deleteRules([rule]),
      },
    ],
    [deleteRules, navigate, t]
  )
}
