import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { PageNavigationItem } from '../../../framework';
import { PageNotImplemented } from '../../../framework/PageEmptyStates/PageNotImplemented';
import { AwxRoute } from '../AwxRoutes';
import { NotificationPage } from '../administration/notifications/NotificationPage/NotificationPage';
import { Notifications } from '../administration/notifications/Notifications';

export function useAwxNotificationsRoutes() {
  const { t } = useTranslation();
  const notificationsRoutes = useMemo<PageNavigationItem>(
    () => ({
      id: AwxRoute.NotificationTemplates,
      label: t('Job Notifications'),
      path: 'notifications',
      children: [
        {
          id: AwxRoute.NotificationTemplatePage,
          path: ':id/',
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
