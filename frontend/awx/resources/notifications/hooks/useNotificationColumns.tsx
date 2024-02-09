import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, usePageNavigate } from '../../../../../framework';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useNameColumn } from '../../../../common/columns';
import { NotificationTemplate } from '../../../interfaces/NotificationTemplate';

export function useNotificationsColumns(options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
}) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const nameClick = useCallback(
    (notificationTemplate: NotificationTemplate) => {
      return pageNavigate(AwxRoute.NotificationTemplatePage, {
        params: {
          id: notificationTemplate.id,
        },
      });
    },
    [pageNavigate]
  );
  const nameColumn = useNameColumn({ ...options, onClick: nameClick });
  const typeColumn = useMemo<ITableColumn<NotificationTemplate>>(
    () => ({
      header: t('Type'),
      type: 'text',
      value: (notificationTemplate: NotificationTemplate) => {
        return notificationTemplate.notification_type;
      },
      card: 'subtitle',
      list: 'subtitle',
    }),
    [t]
  );
  const tableColumns = useMemo<ITableColumn<NotificationTemplate>[]>(
    () => [nameColumn, typeColumn],
    [nameColumn, typeColumn]
  );
  return tableColumns;
}
