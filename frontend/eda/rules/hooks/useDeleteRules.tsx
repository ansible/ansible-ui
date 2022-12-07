import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings, useBulkConfirmation } from '../../../../framework';
import { requestDelete } from '../../../Data';
import { idKeyFn } from '../../../hub/useHubView';
import { EdaRule } from '../../interfaces/EdaRule';
import { useRuleColumns } from './useRuleColumns';

export function useDeleteRules(onComplete: (rules: EdaRule[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useRuleColumns();
  const actionColumns = useMemo(() => [confirmationColumns[0]], [confirmationColumns]);
  const bulkAction = useBulkConfirmation<EdaRule>();
  return useCallback(
    (rules: EdaRule[]) => {
      bulkAction({
        title: t('Permanently delete rules', { count: rules.length }),
        confirmText: t('Yes, I confirm that I want to delete these {{count}} rules.', {
          count: rules.length,
        }),
        actionButtonText: t('Delete rules', { count: rules.length }),
        items: rules.sort((l, r) => compareStrings(l.name, r.name)),
        keyFn: idKeyFn,
        isDanger: true,
        confirmationColumns,
        actionColumns,
        onComplete,
        actionFn: (rule: EdaRule) => requestDelete(`/api/rules/${rule.id}`),
      });
    },
    [actionColumns, bulkAction, confirmationColumns, onComplete, t]
  );
}
