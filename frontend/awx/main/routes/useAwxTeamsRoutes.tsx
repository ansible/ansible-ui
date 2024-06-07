import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { PageNavigationItem } from '../../../../framework';
import { CreateTeam, EditTeam } from '../../access/teams/TeamForm';
import { AwxTeamDetails } from '../../access/teams/TeamPage/AwxTeamDetails';
import { TeamAccess } from '../../access/teams/TeamPage/TeamAccess';
import { TeamPage } from '../../access/teams/TeamPage/TeamPage';
import { Teams } from '../../access/teams/Teams';
import { AwxRoute } from '../AwxRoutes';
import { AwxAddTeamRoles } from '../../access/teams/AwxAddTeamRoles';
import { AwxTeamRoles } from '../../access/teams/TeamPage/AwxTeamRoles';
import { TeamMembersAdd } from '../../access/teams/components/TeamMembersAdd';

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
          element: <AwxAddTeamRoles />,
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
              id: AwxRoute.TeamMembers,
              path: 'access',
              element: <TeamAccess />,
            },
            {
              id: AwxRoute.TeamRoles,
              path: 'roles',
              element: <AwxTeamRoles />,
            },
            {
              path: '',
              element: <Navigate to="details" replace />,
            },
          ],
        },
        {
          id: AwxRoute.TeamAddMembers,
          path: ':id/user-access/add',
          element: <TeamMembersAdd />,
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
