import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings, useBulkConfirmation } from '../../../../framework';
import { requestDelete } from '../../../common/crud/Data';
import { idKeyFn } from '../../../hub/useHubView';
import { API_PREFIX } from '../../constants';
import { EdaDecisionEnvironment } from '../../interfaces/EdaDecisionEnvironment';
import { useDecisionEnvironmentColumns } from './useDecisionEnvironmentColumns';

export function useDeleteDecisionEnvironments(
  onComplete: (DecisionEnvironments: EdaDecisionEnvironment[]) => void
) {
  const { t } = useTranslation();
  const confirmationColumns = useDecisionEnvironmentColumns();
  const actionColumns = useMemo(() => [confirmationColumns[0]], [confirmationColumns]);
  const bulkAction = useBulkConfirmation<EdaDecisionEnvironment>();
  return useCallback(
    (DecisionEnvironments: EdaDecisionEnvironment[]) => {
      bulkAction({
        title: t('Permanently delete DecisionEnvironments', {
          count: DecisionEnvironments.length,
        }),
        confirmText: t(
          'Yes, I confirm that I want to delete these {{count}} DecisionEnvironments.',
          {
            count: DecisionEnvironments.length,
          }
        ),
        actionButtonText: t('Delete DecisionEnvironments', {
          count: DecisionEnvironments.length,
        }),
        items: DecisionEnvironments.sort((l, r) => compareStrings(l.name, r.name)),
        keyFn: idKeyFn,
        isDanger: true,
        confirmationColumns,
        actionColumns,
        onComplete,
        actionFn: (DecisionEnvironment: EdaDecisionEnvironment) =>
          requestDelete(`${API_PREFIX}/DecisionEnvironments/${DecisionEnvironment.id}`),
      });
    },
    [actionColumns, bulkAction, confirmationColumns, onComplete, t]
  );
}
