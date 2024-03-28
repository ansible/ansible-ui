import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { PageNavigationItem } from '../../../../framework';
import { PageNotImplemented } from '../../../../framework/PageEmptyStates/PageNotImplemented';
import { Notifiers } from '../../administration/notifiers/Notifiers';
import { AwxRoute } from '../AwxRoutes';

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
          element: <Notifiers />,
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
          element: <Notifiers />,
        },
      ],
    }),
    [t]
  );
  return notificationsRoutes;
}
