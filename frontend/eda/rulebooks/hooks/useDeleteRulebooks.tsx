import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { compareStrings, useBulkConfirmation } from '../../../../framework'
import { requestDelete } from '../../../Data'
import { idKeyFn } from '../../../hub/useHubView'
import { EdaRulebook } from '../../interfaces/EdaRulebook2'
import { useRulebookColumns } from './useRulebookColumns'

export function useDeleteRulebooks(onComplete: (rulebooks: EdaRulebook[]) => void) {
  const { t } = useTranslation()
  const confirmationColumns = useRulebookColumns()
  const actionColumns = useMemo(() => [confirmationColumns[0]], [confirmationColumns])
  const bulkAction = useBulkConfirmation<EdaRulebook>()
  return useCallback(
    (rulebooks: EdaRulebook[]) => {
      bulkAction({
        title: t('Permanently delete rulebooks', { count: rulebooks.length }),
        confirmText: t('Yes, I confirm that I want to delete these {{count}} rulebooks.', {
          count: rulebooks.length,
        }),
        actionButtonText: t('Delete rulebooks', { count: rulebooks.length }),
        items: rulebooks.sort((l, r) => compareStrings(l.name, r.name)),
        keyFn: idKeyFn,
        isDanger: true,
        confirmationColumns,
        actionColumns,
        onComplete,
        actionFn: (rulebook: EdaRulebook) => requestDelete(`/api/rulebooks/${rulebook.id}`),
      })
    },
    [actionColumns, bulkAction, confirmationColumns, onComplete, t]
  )
}
