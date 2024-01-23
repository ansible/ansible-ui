import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings } from '../../../../../framework';
import { useNameColumn } from '../../../../common/columns';
import { getItemKey, requestDelete } from '../../../../common/crud/Data';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxBulkConfirmation } from '../../../common/useAwxBulkConfirmation';
import { Schedule } from '../../../interfaces/Schedule';
import { useSchedulesColumns } from './useSchedulesColumns';

export function useDeleteSchedules(onComplete?: (schedules: Schedule[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useSchedulesColumns({ disableLinks: true, disableSort: true });
  const deleteActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true });
  const actionColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn]);

  const bulkAction = useAwxBulkConfirmation<Schedule>();
  const deleteSchedules = (schedules: Schedule[]) => {
    bulkAction({
      title: t('Permanently delete schedule', { count: schedules.length }),
      confirmText: t('Yes, I confirm that I want to delete these {{count}} schedules.', {
        count: schedules.length,
      }),
      actionButtonText: t('Delete schedule', { count: schedules.length }),
      items: schedules.sort((l, r) => compareStrings(l.name, r.name)),
      keyFn: getItemKey,
      isDanger: true,
      confirmationColumns,
      actionColumns: actionColumns,
      onComplete,
      actionFn: (schedule: Schedule, signal) =>
        requestDelete(awxAPI`/schedules/${schedule.id.toString()}/`, signal),
    });
  };
  return deleteSchedules;
}
