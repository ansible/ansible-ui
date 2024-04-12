import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, TextCell } from '../../../../../framework';
import { NotificationTemplate } from '../../../interfaces/NotificationTemplate';
import { StatusCell } from '../../../../common/Status';
import { useOrganizationNameColumn } from '../../../../common/columns';
import { AwxRoute } from '../../../main/AwxRoutes';

export function useNotifiersColumns() {
  const { t } = useTranslation();

  const organizationColumn = useOrganizationNameColumn(AwxRoute.OrganizationDetails);

  const tableColumns = useMemo<ITableColumn<NotificationTemplate>[]>(
    () => [
      {
        header: t('Name'),
        cell: (template: NotificationTemplate) => <TextCell text={template.name} />,
        sort: 'name',
        card: 'name',
        list: 'name',
        defaultSortDirection: 'asc',
        defaultSort: true,
      },
      {
        header: t('Status'),
        cell: (template: NotificationTemplate) => (
          <StatusCell
            status={
              template.summary_fields?.recent_notifications &&
              template.summary_fields.recent_notifications.length > 0
                ? template.summary_fields?.recent_notifications[0].status
                : undefined
            }
          />
        ),
      },
      {
        header: t('Type'),
        cell: (template: NotificationTemplate) => <TextCell text={template.notification_type} />,
        sort: 'notification_type',
      },
      organizationColumn,
    ],
    [t, organizationColumn]
  );
  return tableColumns;
}
