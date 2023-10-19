import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageNavigationItem } from '../../framework';
import { AwxRoute } from './AwxRoutes';
import { Teams } from './access/teams/Teams';
import { Navigate } from 'react-router-dom';
import { TeamRoles } from './access/teams/TeamPage/TeamRoles';
import { TeamAccess } from './access/teams/TeamPage/TeamAccess';
import { TeamDetails } from './access/teams/TeamPage/TeamDetails';
import { TeamPage } from './access/teams/TeamPage/TeamPage';
import { AddRolesToTeam } from './access/teams/components/AddRolesToTeam';
import { CreateTeam, EditTeam } from './access/teams/TeamForm';

export function useGetAwxTeamsRoutes() {
  const { t } = useTranslation();
  const teamsRoutes = useMemo<PageNavigationItem>(
    () => ({
      id: AwxRoute.Teams,
      label: t('Teams'),
      path: 'teams',
      children: [
        {
          id: AwxRoute.CreateTeam,
          path: 'create',
          element: <CreateTeam />,
        },
        {
          id: AwxRoute.EditTeam,
          path: ':id/edit',
          element: <EditTeam />,
        },
        {
          id: AwxRoute.AddRolesToTeam,
          path: ':id/roles/add',
          element: <AddRolesToTeam />,
        },
        {
          id: AwxRoute.TeamPage,
          path: ':id',
          element: <TeamPage />,
          children: [
            {
              id: AwxRoute.TeamDetails,
              path: 'details',
              element: <TeamDetails />,
            },
            {
              id: AwxRoute.TeamAccess,
              path: 'access',
              element: <TeamAccess />,
            },
            {
              id: AwxRoute.TeamRoles,
              path: 'roles',
              element: <TeamRoles />,
            },
            {
              path: '',
              element: <Navigate to="details" />,
            },
          ],
        },
        {
          path: '',
          element: <Teams />,
        },
      ],
    }),
    [t]
  );
  return teamsRoutes;
}
