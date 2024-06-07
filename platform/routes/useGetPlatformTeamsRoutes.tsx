import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageNavigationItem } from '../../framework';
import { PlatformTeamDetails } from '../access/teams/components/PlatformTeamDetails';
import { CreatePlatformTeam, EditPlatformTeam } from '../access/teams/components/PlatformTeamForm';
import { PlatformTeamList } from '../access/teams/components/PlatformTeamList';
import { PlatformTeamPage } from '../access/teams/components/PlatformTeamPage';
import { PlatformRoute } from '../main/PlatformRoutes';
import { PlatformTeamUsers } from '../access/teams/components/PlatformTeamUsers';
import { PlatformTeamAdmins } from '../access/teams/components/PlatformTeamAdmins';
import { PlatformTeamRoles } from '../access/teams/components/PlatformTeamRoles';
import { PlatformAwxTeamIdLookup } from '../access/teams/components/PlatformAwxTeamIdLookup';
import { PlatformEdaTeamIdLookup } from '../access/teams/components/PlatformEdaTeamIdLookup';
import { EdaTeamRoles } from '../../frontend/eda/access/teams/TeamPage/EdaTeamRoles';
import { AwxTeamRoles } from '../../frontend/awx/access/teams/TeamPage/AwxTeamRoles';
import { Navigate } from 'react-router-dom';
import { EdaAddTeamRoles } from '../../frontend/eda/access/teams/EdaAddTeamRoles';
import { AwxAddTeamRoles } from '../../frontend/awx/access/teams/AwxAddTeamRoles';

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
              element: <PlatformTeamRoles />,
              children: [
                {
                  id: PlatformRoute.AwxTeamRoles,
                  path: 'controller',
                  element: (
                    <PlatformAwxTeamIdLookup>
                      <AwxTeamRoles addRolesRoute={PlatformRoute.AwxTeamAddRoles} />
                    </PlatformAwxTeamIdLookup>
                  ),
                },
                {
                  id: PlatformRoute.EdaTeamRoles,
                  path: 'eda',
                  element: (
                    <PlatformEdaTeamIdLookup>
                      <EdaTeamRoles addRolesRoute={PlatformRoute.EdaTeamAddRoles} />
                    </PlatformEdaTeamIdLookup>
                  ),
                },
                {
                  path: '',
                  element: <Navigate to="controller" />,
                },
              ],
            },
            {
              id: PlatformRoute.TeamUsers,
              path: 'users',
              element: <PlatformTeamUsers />,
            },
            {
              id: PlatformRoute.TeamAdmins,
              path: 'admins',
              element: <PlatformTeamAdmins />,
            },
          ],
        },
        {
          id: PlatformRoute.AwxTeamAddRoles,
          path: ':id/roles/controller/add-roles',
          element: (
            <PlatformAwxTeamIdLookup>
              <AwxAddTeamRoles teamRolesRoute={PlatformRoute.AwxTeamRoles} />
            </PlatformAwxTeamIdLookup>
          ),
        },
        {
          id: PlatformRoute.EdaTeamAddRoles,
          path: ':id/roles/eda/add-roles',
          element: (
            <PlatformEdaTeamIdLookup>
              <EdaAddTeamRoles teamRolesRoute={PlatformRoute.EdaTeamRoles} />
            </PlatformEdaTeamIdLookup>
          ),
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
