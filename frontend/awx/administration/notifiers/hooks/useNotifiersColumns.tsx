import { ITableColumn, TextCell, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { StatusCell } from '@ansible/common-ui/Status';
import { useOrganizationNameColumn } from '@ansible/common-ui/columns';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { NotificationTemplate } from '../../../interfaces/NotificationTemplate';
import { AwxRoute } from '../../../main/AwxRoutes';
import { RunningNotificationsType } from './useNotifiersRowActions';

export function useNotifiersColumns(params?: { runningNotifications?: RunningNotificationsType }) {
  const { t } = useTranslation();

  const organizationColumn = useOrganizationNameColumn(AwxRoute.OrganizationDetails);
  const getPageUrl = useGetPageUrl();
  const runningNotifications = params?.runningNotifications;

  const tableColumns = useMemo<ITableColumn<NotificationTemplate>[]>(
    () => [
      {
        header: t('Name'),
        cell: (template: NotificationTemplate) => (
          <TextCell
            text={template.name}
            to={getPageUrl(AwxRoute.NotificationTemplateDetails, {
              params: { id: template.id },
            })}
          />
        ),

        sort: 'name',
        card: 'name',
        list: 'name',
        defaultSortDirection: 'asc',
        defaultSort: true,
      },
      {
        header: t('Status'),
        cell: (template: NotificationTemplate) => {
          if (runningNotifications?.[template.id]) {
            return <StatusCell status={'running'}></StatusCell>;
          }
          return (
            <StatusCell
              status={
                template.summary_fields?.recent_notifications &&
                template.summary_fields.recent_notifications.length > 0
                  ? template.summary_fields?.recent_notifications[0].status
                  : undefined
              }
            />
          );
        },
      },
      {
        header: t('Type'),
        cell: (template: NotificationTemplate) => <TextCell text={template.notification_type} />,
        sort: 'notification_type',
      },
      organizationColumn,
    ],
    [t, organizationColumn, getPageUrl, runningNotifications]
  );
  return tableColumns;
}
