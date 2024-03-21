import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings } from '../../../../../framework';
import { useNameColumn } from '../../../../common/columns';
import { getItemKey, requestDelete } from '../../../../common/crud/Data';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxBulkConfirmation } from '../../../common/useAwxBulkConfirmation';
import { useNotifiersColumns } from './useNotifiersColumns';
import { NotificationTemplate } from '../../../interfaces/NotificationTemplate';

export function useDeleteNotifiers(onComplete: (notification: NotificationTemplate[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useNotifiersColumns();
  const deleteActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true });
  const actionColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn]);
  const bulkAction = useAwxBulkConfirmation<NotificationTemplate>();
  const deleteNotifications = (notification: NotificationTemplate[]) => {
    bulkAction({
      title: t('Delete notifiers', { count: notification.length }),
      confirmText: t('Yes, I confirm that I want to delete these {{count}} notifiers.', {
        count: notification.length,
      }),
      actionButtonText: t('Delete notifiers', { count: notification.length }),
      items: notification.sort((l, r) => compareStrings(l.name, r.name)),
      keyFn: getItemKey,
      isDanger: true,
      confirmationColumns,
      actionColumns,
      onComplete,
      actionFn: (notification: NotificationTemplate, signal) =>
        requestDelete(awxAPI`/notification_templates/${notification.id.toString()}/`, signal),
    });
  };
  return deleteNotifications;
}
