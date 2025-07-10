import { PageNavigationItem } from '@ansible/ansible-ui-framework';
import { AwxAddTeamRoles } from '@ansible/awx-ui/access/teams/AwxAddTeamRoles';
import { AwxTeamRoles } from '@ansible/awx-ui/access/teams/TeamPage/AwxTeamRoles';
import { EdaAddTeamRoles } from '@ansible/eda-ui/access/teams/EdaAddTeamRoles';
import { EdaTeamRoles } from '@ansible/eda-ui/access/teams/TeamPage/EdaTeamRoles';
import { HubTeamRoles } from '@ansible/hub-ui/access/teams/TeamPage/TeamUserRole';
import { HubAddTeamRoles } from '@ansible/hub-ui/access/teams/components/HubAddTeamRoles';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router';
import { PlatformAAPTeamUsers } from '../access/teams/components/PlatformAAPTeamUsers';
import { PlatformAwxTeamIdLookup } from '../access/teams/components/PlatformAwxTeamIdLookup';
import { PlatformEdaTeamIdLookup } from '../access/teams/components/PlatformEdaTeamIdLookup';
import { PlatformHubTeamIdLookup } from '../access/teams/components/PlatformHubTeamIdLookup';
import { PlatformTeamAdmins } from '../access/teams/components/PlatformTeamAdmins';
import { PlatformTeamDetails } from '../access/teams/components/PlatformTeamDetails';
import { CreatePlatformTeam, EditPlatformTeam } from '../access/teams/components/PlatformTeamForm';
import { PlatformTeamList } from '../access/teams/components/PlatformTeamList';
import { PlatformTeamPage } from '../access/teams/components/PlatformTeamPage';
import { PlatformTeamRoles } from '../access/teams/components/PlatformTeamRoles';
import { useGatewayService } from '../main/GatewayServices';
import { PlatformRoute } from '../main/PlatformRoutes';

export function useGetPlatformTeamsRoutes() {
  const { t } = useTranslation();
  const awxService = useGatewayService('controller');
  const edaService = useGatewayService('eda');

  let fallbackRoute = 'controller';
  if (!awxService) {
    fallbackRoute = edaService ? 'eda' : 'hub';
  }

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
                  id: PlatformRoute.HubTeamRoles,
                  path: 'hub',
                  element: (
                    <PlatformHubTeamIdLookup>
                      <HubTeamRoles addRolesRoute={PlatformRoute.HubTeamAddRoles} />
                    </PlatformHubTeamIdLookup>
                  ),
                },
                {
                  path: '',
                  element: <Navigate to={fallbackRoute} />,
                },
              ],
            },
            {
              id: PlatformRoute.TeamUsers,
              path: 'users',
              element: <PlatformAAPTeamUsers />,
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
          id: PlatformRoute.HubTeamAddRoles,
          path: ':id/roles/hub/add-roles',
          element: (
            <PlatformHubTeamIdLookup>
              <HubAddTeamRoles teamRolesRoute={PlatformRoute.HubTeamRoles} />
            </PlatformHubTeamIdLookup>
          ),
        },
        {
          path: '',
          element: <PlatformTeamList />,
        },
      ],
    }),
    [t, fallbackRoute]
  );
  return teamsRoutes;
}
