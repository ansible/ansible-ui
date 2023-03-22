import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings, useBulkConfirmation } from '../../../../../framework';
import { useNameColumn } from '../../../../common/columns';
import { getItemKey, requestDelete } from '../../../../common/crud/Data';
import { ExecutionEnvironment } from '../../../interfaces/ExecutionEnvironment';
import { useExecutionEnvironmentsColumns } from '../ExecutionEnvironments';

export function useDeleteExecutionEnvironments(
  onComplete: (executionEnvironments: ExecutionEnvironment[]) => void
) {
  const { t } = useTranslation();
  const confirmationColumns = useExecutionEnvironmentsColumns({
    disableLinks: true,
    disableSort: true,
  });
  const deleteActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true });
  const actionColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn]);
  const bulkAction = useBulkConfirmation<ExecutionEnvironment>();
  const deleteExecutionEnvironments = (executionEnvironments: ExecutionEnvironment[]) => {
    bulkAction({
      title:
        executionEnvironments.length === 1
          ? t('Permanently delete executionEnvironment')
          : t('Permanently delete executionEnvironments'),
      confirmText: t(
        'Yes, I confirm that I want to delete these {{count}} executionEnvironments.',
        { count: executionEnvironments.length }
      ),
      actionButtonText: t('Delete executionEnvironment', { count: executionEnvironments.length }),
      items: executionEnvironments.sort((l, r) => compareStrings(l.name, r.name)),
      keyFn: getItemKey,
      isDanger: true,
      confirmationColumns,
      actionColumns,
      onComplete,
      actionFn: (executionEnvironment: ExecutionEnvironment) =>
        requestDelete(`/api/v2/executionEnvironments/${executionEnvironment.id}/`),
    });
  };
  return deleteExecutionEnvironments;
}
