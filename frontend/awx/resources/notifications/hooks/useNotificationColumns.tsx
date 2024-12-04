import { ITableColumn, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { capitalizeFirstLetter } from '@ansible/ansible-ui-framework/utils/strings';
import { useNameColumn } from '@ansible/common-ui/columns';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { NotificationTemplate } from '../../../interfaces/NotificationTemplate';
import { AwxRoute } from '../../../main/AwxRoutes';

export function useNotificationsColumns(options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
}) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const nameTo = useCallback(
    (item: NotificationTemplate) =>
      getPageUrl(AwxRoute.NotificationTemplateDetails, { params: { id: item.id } }),
    [getPageUrl]
  );
  const nameColumn = useNameColumn({
    ...options,
    to: nameTo,
  });
  const typeColumn = useMemo<ITableColumn<NotificationTemplate>>(
    () => ({
      header: t('Type'),
      type: 'text',
      value: (notificationTemplate: NotificationTemplate) => {
        return capitalizeFirstLetter(notificationTemplate.notification_type as string);
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
