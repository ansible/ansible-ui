import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { PageNavigationItem } from '../../../../framework';
import { Notifiers } from '../../administration/notifiers/Notifiers';
import { AwxRoute } from '../AwxRoutes';

import { AddNotifier, EditNotifier } from '../../administration/notifiers/NotifierForm';

import { NotificationDetails } from '../../administration/notifiers/NotificationPage/NotificationDetails';
import { NotificationPage } from '../../administration/notifiers/NotificationPage/NotificationPage';
import { NotificationTeamAccess } from '../../administration/notifiers/NotificationPage/NotificationTeamAccess';
import { NotificationUserAccess } from '../../administration/notifiers/NotificationPage/NotificationUserAccess';
import { NotifierAddUsers } from '../../administration/notifiers/components/NotifierAddUsers';
import { NotifierAddTeams } from '../../administration/notifiers/components/NotifierAddTeams';

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
              id: AwxRoute.NotificationTemplateTeamAccess,
              path: 'team-access',
              element: <NotificationTeamAccess />,
            },
            {
              id: AwxRoute.NotificationTemplateUserAccess,
              path: 'user-access',
              element: <NotificationUserAccess />,
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
          id: AwxRoute.NotificationAddUsers,
          path: ':id/user-access/add-users',
          element: <NotifierAddUsers />,
        },
        {
          id: AwxRoute.NotificationAddTeams,
          path: ':id/team-access/add',
          element: <NotifierAddTeams />,
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
