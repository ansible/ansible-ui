import { useTranslation } from 'react-i18next';
import { compareStrings, useBulkConfirmation } from '../../../../../framework';
import { useNameColumn } from '../../../../common/columns';
import { getItemKey, requestDelete } from '../../../../common/crud/Data';
import { Schedule } from '../../../interfaces/Schedule';
import { useSchedulesColumns } from './useSchedulesColumns';

export function useDeleteSchedules(onComplete?: (schedules: Schedule[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useSchedulesColumns({ disableLinks: true, disableSort: true });
  const deleteActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true });
  const bulkAction = useBulkConfirmation<Schedule>();
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
      actionColumns: [deleteActionNameColumn],
      onComplete,
      actionFn: (schedule: Schedule) => requestDelete(`/api/v2/schedules/${schedule.id}/`),
    });
  };
  return deleteSchedules;
}
