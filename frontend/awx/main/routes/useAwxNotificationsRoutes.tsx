import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { PageNavigationItem } from '../../../../framework';
import { Notifiers } from '../../administration/notifiers/Notifiers';
import { AwxRoute } from '../AwxRoutes';

import { AddNotifier, EditNotifier } from '../../administration/notifiers/NotifierForm';

import { NotificationDetails } from '../../administration/notifiers/NotificationPage/NotificationDetails';
import { NotificationPage } from '../../administration/notifiers/NotificationPage/NotificationPage';

export function useAwxNotificationsRoutes() {
  const { t } = useTranslation();
  const notificationsRoutes = useMemo<PageNavigationItem>(
    () => ({
      id: AwxRoute.NotificationTemplates,
      label: t('Notifiers'),
      path: 'notifiers',
      children: [
        {
          id: AwxRoute.NotificationTemplatePage,
          path: ':id/',
          element: <NotificationPage />,
          children: [
            {
              id: AwxRoute.NotificationTemplateDetails,
              path: 'details',
              element: <NotificationDetails />,
            },
            {
              path: '',
              element: <Navigate to="details" />,
            },
          ],
        },
        {
          id: AwxRoute.EditNotificationTemplate,
          path: ':id/edit',
          element: <EditNotifier />,
        },
        {
          id: AwxRoute.AddNotificationTemplate,
          path: 'create',
          element: <AddNotifier />,
        },
        {
          path: '',
          element: <Notifiers />,
        },
      ],
    }),
    [t]
  );
  return notificationsRoutes;
}
