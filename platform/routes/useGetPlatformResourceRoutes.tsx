import { PlatformRoute } from '../main/PlatformRoutes';
import { AwxRoute } from '../../frontend/awx/main/AwxRoutes';
import { EdaRoute } from '../../frontend/eda/main/EdaRoutes';
import { PlatformAwxOrganization } from '../resource/PlatformAwxOrganization';
import { PlatformAwxUser } from '../resource/PlatformAwxUser';
import { PlatformAwxTeam } from '../resource/PlatformAwxTeam';
import { PlatformEdaOrganization } from '../resource/PlatformEdaOrganization';
import { PlatformEdaUser } from '../resource/PlatformEdaUser';
import { PlatformResource } from '../resource/PlatformResource';

/*
  Routes to handle links from various service pages org/user/teams pages,
  routing them from the service to the corresponding gateway resource page.
*/
export function useGetPlatformResourceRoutes() {
  return {
    id: PlatformRoute.PlatformResources,
    path: 'resources',
    children: [
      {
        id: PlatformRoute.PlatformResource,
        path: ':resource_type/:ansible_id',
        element: <PlatformResource />,
      },
      {
        id: PlatformRoute.PlatformResourceRoute,
        path: ':resource_type/:ansible_id/:route',
        element: <PlatformResource />,
      },
      {
        id: AwxRoute.OrganizationPage,
        path: 'controller/organization/:id',
        element: <PlatformAwxOrganization />,
      },
      {
        id: AwxRoute.OrganizationDetails,
        path: 'controller/organization/:id/details',
        element: <PlatformAwxOrganization />,
      },
      {
        id: AwxRoute.OrganizationUsersAccess,
        path: 'controller/organization/:id/users',
        element: <PlatformAwxOrganization route={PlatformRoute.OrganizationUsers} />,
      },
      {
        id: AwxRoute.OrganizationTeamsAccess,
        path: 'controller/organization/:id/teams',
        element: <PlatformAwxOrganization route={PlatformRoute.OrganizationTeams} />,
      },
      {
        id: AwxRoute.OrganizationExecutionEnvironments,
        path: 'controller/organization/:id/execution-environments',
        element: <PlatformAwxOrganization />,
      },
      {
        id: AwxRoute.OrganizationNotifications,
        path: 'controller/organization/:id/notifications',
        element: <PlatformAwxOrganization />,
      },
      {
        id: AwxRoute.UserPage,
        path: 'controller/user/:id',
        element: <PlatformAwxUser />,
      },
      {
        id: AwxRoute.UserDetails,
        path: 'controller/user/:id/details',
        element: <PlatformAwxUser />,
      },
      {
        id: AwxRoute.UserOrganizations,
        path: 'controller/user/:id/organizations',
        element: <PlatformAwxUser />,
      },
      {
        id: AwxRoute.UserTeams,
        path: 'controller/user/:id/teams',
        element: <PlatformAwxUser route={PlatformRoute.UserTeams} />,
      },
      {
        id: AwxRoute.UserRoles,
        path: 'controller/user/:id/roles',
        element: <PlatformAwxUser route={PlatformRoute.UserRoles} />,
      },
      {
        id: AwxRoute.UserTokens,
        path: 'controller/user/:id/tokens',
        element: <PlatformAwxUser />,
      },
      {
        id: AwxRoute.TeamPage,
        path: 'controller/team/:id',
        element: <PlatformAwxTeam />,
      },
      {
        id: AwxRoute.TeamDetails,
        path: 'controller/team/:id/details',
        element: <PlatformAwxTeam />,
      },
      {
        id: AwxRoute.TeamMembers,
        path: 'controller/team/:id/teams',
        element: <PlatformAwxTeam route={PlatformRoute.TeamUsers} />,
      },
      {
        id: AwxRoute.TeamRoles,
        path: 'controller/team/:id/roles',
        element: <PlatformAwxTeam route={PlatformRoute.TeamRoles} />,
      },
      {
        id: EdaRoute.OrganizationPage,
        path: 'eda/organization/:id',
        element: <PlatformEdaOrganization />,
      },
      {
        id: EdaRoute.OrganizationDetails,
        path: 'eda/organization/:id/details',
        element: <PlatformEdaOrganization />,
      },
      {
        id: EdaRoute.UserPage,
        path: 'eda/user/:id',
        element: <PlatformEdaUser />,
      },
      {
        id: EdaRoute.UserDetails,
        path: 'eda/user/:id',
        element: <PlatformEdaUser />,
      },
      {
        id: EdaRoute.UserTokens,
        path: 'eda/user/:id',
        element: <PlatformEdaUser />,
      },
      {
        id: EdaRoute.UserRoles,
        path: 'eda/user/:id',
        element: <PlatformEdaUser route={PlatformRoute.UserRoles} />,
      },
    ],
  };
}
