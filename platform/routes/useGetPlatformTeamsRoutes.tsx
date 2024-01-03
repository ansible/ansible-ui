import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageNavigationItem, PageNotImplemented } from '../../framework';
import { PlatformRoute } from '../PlatformRoutes';
import { PlatformTeamDetails } from '../access/teams/components/PlatformTeamDetails';
import { CreatePlatformTeam, EditPlatformTeam } from '../access/teams/components/PlatformTeamForm';
import { PlatformTeamList } from '../access/teams/components/PlatformTeamList';
import { PlatformTeamPage } from '../access/teams/components/PlatformTeamPage';

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
          element: <CreatePlatformTeam />,
        },
        {
          id: PlatformRoute.EditTeam,
          path: ':id/edit',
          element: <EditPlatformTeam />,
        },
        {
          id: PlatformRoute.TeamPage,
          path: ':id',
          element: <PlatformTeamPage />,
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
          element: <PlatformTeamList />,
        },
      ],
    }),
    [t]
  );
  return teamsRoutes;
}
