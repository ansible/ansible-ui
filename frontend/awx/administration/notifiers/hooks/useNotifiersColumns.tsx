import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, TextCell } from '../../../../../framework';
import { NotificationTemplate } from '../../../interfaces/NotificationTemplate';
import { StatusCell } from '../../../../common/Status';

export function useNotifiersColumns() {
  const { t } = useTranslation();
  const tableColumns = useMemo<ITableColumn<NotificationTemplate>[]>(
    () => [
      {
        header: t('Name'),
        cell: (template: NotificationTemplate) => <TextCell text={template.name} />,
        sort: 'name',
        card: 'name',
        list: 'name',
        defaultSortDirection: 'desc',
        defaultSort: true,
      },
      {
        header: t('Status'),
        cell: (template: NotificationTemplate) => (
          <StatusCell
            status={
              template.summary_fields.recent_notifications.length > 0
                ? template.summary_fields.recent_notifications[0].status
                : undefined
            }
          />
        ),
      },
      {
        header: t('Type'),
        cell: (template: NotificationTemplate) => <TextCell text={template.notification_type} />,
      },
    ],
    [t]
  );
  return tableColumns;
}
