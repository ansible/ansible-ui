import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { PageNavigationItem } from '../../../../framework';
import { CreateTeam, EditTeam } from '../../access/teams/TeamForm';
import { AwxTeamDetails } from '../../access/teams/TeamPage/AwxTeamDetails';
import { TeamAccess } from '../../access/teams/TeamPage/TeamAccess';
import { TeamPage } from '../../access/teams/TeamPage/TeamPage';
import { TeamRoles } from '../../access/teams/TeamPage/TeamRoles';
import { Teams } from '../../access/teams/Teams';
import { AddRolesToTeam } from '../../access/teams/components/AddRolesToTeam';
import { AwxRoute } from '../AwxRoutes';

export function useAwxTeamsRoutes() {
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
              element: <AwxTeamDetails />,
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
