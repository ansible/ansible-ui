import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageNavigationItem } from '../../framework';
import { AwxRoute } from './AwxRoutes';
import { PageNotImplemented } from '../common/PageNotImplemented';
import { NotificationPage } from './administration/notifications/NotificationPage/NotificationPage';
import { Navigate } from 'react-router-dom';
import { Notifications } from './administration/notifications/Notifications';

export function useGetAwxNotificationsRoutes() {
  const { t } = useTranslation();
  const notificationsRoutes = useMemo<PageNavigationItem>(
    () => ({
      id: AwxRoute.NotificationTemplates,
      label: t('Notifications'),
      path: 'notifications',
      children: [
        {
          id: AwxRoute.NotificationTemplatePage,
          path: ':id/*',
          element: <NotificationPage />,
          children: [
            {
              id: AwxRoute.NotificationTemplateDetails,
              path: 'details',
              element: <PageNotImplemented />,
            },
            {
              path: '',
              element: <Navigate to="details" />,
            },
          ],
        },
        {
          path: '',
          element: <Notifications />,
        },
      ],
    }),
    [t]
  );
  return notificationsRoutes;
}
