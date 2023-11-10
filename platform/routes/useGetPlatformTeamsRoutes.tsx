import { useTranslation } from 'react-i18next';
import { PageNavigationItem, PageNotImplemented } from '../../framework';
import { useMemo } from 'react';
import { PlatformRoute } from '../PlatformRoutes';
import { CreateTeam, EditTeam } from '../access/teams/components/TeamForm';
import { TeamPage } from '../access/teams/components/TeamPage';
import { PlatformTeamDetails } from '../access/teams/components/PlatformTeamDetails';
import { TeamList } from '../access/teams/components/TeamList';

export function useGetPlatformTeamsRoutes() {
  const { t } = useTranslation();
  const teamsRoutes = useMemo<PageNavigationItem>(
    () => ({
      id: PlatformRoute.Teams,
      label: t('Teams'),
      path: 'teams',
      children: [
        {
          id: PlatformRoute.CreateTeam,
          path: 'create',
          element: <CreateTeam />,
        },
        {
          id: PlatformRoute.EditTeam,
          path: ':id/edit',
          element: <EditTeam />,
        },
        {
          id: PlatformRoute.TeamPage,
          path: ':id',
          element: <TeamPage />,
          children: [
            {
              id: PlatformRoute.TeamDetails,
              path: 'details',
              element: <PlatformTeamDetails />,
            },
            {
              id: PlatformRoute.TeamRoles,
              path: 'roles',
              element: <PageNotImplemented />,
            },
            {
              id: PlatformRoute.TeamUsers,
              path: 'users',
              element: <PageNotImplemented />,
            },
            {
              id: PlatformRoute.TeamResourceAccess,
              path: 'resource-access',
              element: <PageNotImplemented />,
            },
          ],
        },
        {
          path: '',
          element: <TeamList />,
        },
      ],
    }),
    [t]
  );
  return teamsRoutes;
}
