import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings } from '../../../../../framework';
import { useNameColumn } from '../../../../common/columns';
import { getItemKey, requestDelete } from '../../../../common/crud/Data';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxBulkConfirmation } from '../../../common/useAwxBulkConfirmation';
import { ExecutionEnvironment } from '../../../interfaces/ExecutionEnvironment';
import { useExecutionEnvironmentsColumns } from './useExecutionEnvironmentsColumns';

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
  const bulkAction = useAwxBulkConfirmation<ExecutionEnvironment>();
  const deleteExecutionEnvironments = (executionEnvironments: ExecutionEnvironment[]) => {
    bulkAction({
      title: t('Permanently delete execution environments', {
        count: executionEnvironments.length,
      }),
      confirmText: t(
        'Yes, I confirm that I want to delete these {{count}} execution environments.',
        { count: executionEnvironments.length }
      ),
      actionButtonText: t('Delete execution environments', { count: executionEnvironments.length }),
      items: executionEnvironments.sort((l, r) => compareStrings(l.name, r.name)),
      keyFn: getItemKey,
      isDanger: true,
      confirmationColumns,
      actionColumns,
      onComplete,
      actionFn: (executionEnvironment: ExecutionEnvironment, signal) =>
        requestDelete(
          awxAPI`/executionEnvironments/${executionEnvironment.id.toString()}/`,
          signal
        ),
    });
  };
  return deleteExecutionEnvironments;
}
