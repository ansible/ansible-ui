import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings, useBulkConfirmation } from '../../../../framework';
import { requestDelete } from '../../../Data';
import { idKeyFn } from '../../../hub/useHubView';
import { EdaExecutionEnvironment } from '../../interfaces/EdaExecutionEnvironment';
import { useExecutionEnvironmentColumns } from './useExecutionEnvironmentColumns';

export function useDeleteExecutionEnvironments(
  onComplete: (executionEnvironments: EdaExecutionEnvironment[]) => void
) {
  const { t } = useTranslation();
  const confirmationColumns = useExecutionEnvironmentColumns();
  const actionColumns = useMemo(() => [confirmationColumns[0]], [confirmationColumns]);
  const bulkAction = useBulkConfirmation<EdaExecutionEnvironment>();
  return useCallback(
    (executionEnvironments: EdaExecutionEnvironment[]) => {
      bulkAction({
        title: t('Permanently delete executionEnvironments', {
          count: executionEnvironments.length,
        }),
        confirmText: t(
          'Yes, I confirm that I want to delete these {{count}} executionEnvironments.',
          {
            count: executionEnvironments.length,
          }
        ),
        actionButtonText: t('Delete executionEnvironments', {
          count: executionEnvironments.length,
        }),
        items: executionEnvironments.sort((l, r) => compareStrings(l.name, r.name)),
        keyFn: idKeyFn,
        isDanger: true,
        confirmationColumns,
        actionColumns,
        onComplete,
        actionFn: (executionEnvironment: EdaExecutionEnvironment) =>
          requestDelete(`/api/executionEnvironments/${executionEnvironment.id}`),
      });
    },
    [actionColumns, bulkAction, confirmationColumns, onComplete, t]
  );
}
