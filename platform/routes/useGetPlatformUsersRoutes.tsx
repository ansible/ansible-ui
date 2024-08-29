import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { PageNavigationItem } from '../../framework';
import { PlatformUserDetails } from '../access/users/components/PlatformUserDetails';
import { CreatePlatformUser, EditPlatformUser } from '../access/users/components/PlatformUserForm';
import { PlatformUsersList } from '../access/users/components/PlatformUsersList';
import { PlatformUserPage } from '../access/users/components/PlatformUserPage';
import { PlatformUserTeams } from '../access/users/components/PlatformUserTeams';
import { PlatformRoute } from '../main/PlatformRoutes';
import { PlatformUserRoles } from '../access/users/components/PlatformUserRoles';
import { UserRoles } from '../../frontend/awx/access/users/UserPage/UserRoles';
import { PlatformAwxUserIdLookup } from '../access/users/components/PlatformAwxUserIdLookup';
import { EdaUserRoles } from '../../frontend/eda/access/users/UserPage/EdaUserRoles';
import { PlatformEdaUserIdLookup } from '../access/users/components/PlatformEdaUserIdLookup';
import { AddRolesToUser } from '../../frontend/awx/access/users/components/AddRolesToUser';
import { EdaAddUserRoles } from '../../frontend/eda/access/users/EdaAddUserRoles';
import { Token } from '../../frontend/awx/interfaces/Token';
import { CreateUserToken } from '../../frontend/awx/access/users/UserTokenForm';
import { AwxRoute } from '../../frontend/awx/main/AwxRoutes';
import { UserTokenPage } from '../../frontend/awx/access/users/UserPage/UserTokenPage';
import { UserTokenSecretsModal } from '../../frontend/awx/access/users/UserPage/UserTokenSecretsModal';
import { UserTokenDetails } from '../../frontend/awx/access/users/UserPage/UserTokenDetails';
import { AAPUserTokens } from '../access/users/components/PlatformAAPUserTokens';
import { CreateAAPUserToken } from '../access/users/components/PlatformAAPUserTokenForm';
import { PlatformAAPUserTokenDetails } from '../access/users/components/PlatformAAPUserTokenDetails';
import { PlatformAAPUserTokenPage } from '../access/users/components/PlatformAAPUserTokenPage';
import { PlatformHubUserIdLookup } from '../access/users/components/PlatformHubUserIdLookup';
import { HubUserRoles } from '../../frontend/hub/access/users/UserPage/HubUserRoles';
import { HubAddUserRoles } from '../../frontend/hub/access/users/components/HubAddUserRoles';

export function useGetPlatformUsersRoutes() {
  const { t } = useTranslation();
  const [newUserToken, setNewUserToken] = useState<Token>();

  const usersRoutes = useMemo<PageNavigationItem>(
    () => ({
      id: PlatformRoute.Users,
      label: t('Users'),
      path: 'users',
      children: [
        {
          id: PlatformRoute.CreateUser,
          path: 'create',
          element: <CreatePlatformUser />,
        },
        {
          id: PlatformRoute.EditUser,
          path: ':id/edit',
          element: <EditPlatformUser />,
        },
        {
          id: PlatformRoute.UserPage,
          path: ':id',
          element: <PlatformUserPage />,
          children: [
            {
              id: PlatformRoute.UserDetails,
              path: 'details',
              element: <PlatformUserDetails />,
            },
            {
              id: PlatformRoute.UserTeams,
              path: 'teams',
              element: <PlatformUserTeams />,
            },
            {
              id: PlatformRoute.UserRoles,
              path: 'roles',
              element: <PlatformUserRoles />,
              children: [
                {
                  id: PlatformRoute.AwxUserRoles,
                  path: 'controller',
                  element: (
                    <PlatformAwxUserIdLookup>
                      <UserRoles addRolesRoute={PlatformRoute.AwxUserAddRoles} />
                    </PlatformAwxUserIdLookup>
                  ),
                },
                {
                  id: PlatformRoute.EdaUserRoles,
                  path: 'eda',
                  element: (
                    <PlatformEdaUserIdLookup>
                      <EdaUserRoles addRolesRoute={PlatformRoute.EdaUserAddRoles} />
                    </PlatformEdaUserIdLookup>
                  ),
                },
                {
                  id: PlatformRoute.HubUserRoles,
                  path: 'hub',
                  element: (
                    <PlatformHubUserIdLookup>
                      <HubUserRoles addRolesRoute={PlatformRoute.HubUserAddRoles} />
                    </PlatformHubUserIdLookup>
                  ),
                },
                {
                  path: '',
                  element: <Navigate to="controller" />,
                },
              ],
            },
            {
              id: PlatformRoute.AAPUserTokens,
              path: 'tokens',
              element: (
                <AAPUserTokens
                  infoMessage={t(
                    'Ansible Automation Platform tokens authenticate your instance to run automation.'
                  )}
                />
              ),
            },
            {
              path: '',
              element: <Navigate to="details" />,
            },
          ],
        },
        {
          id: PlatformRoute.CreateAapUserToken,
          path: ':id/tokens/create',
          element: <CreateAAPUserToken onSuccessfulCreate={(t: Token) => setNewUserToken(t)} />,
        },
        {
          id: PlatformRoute.CreateAwxUserToken,
          path: ':id/tokens/controller/create',
          element: <CreateUserToken onSuccessfulCreate={(t: Token) => setNewUserToken(t)} />,
        },
        {
          id: AwxRoute.UserTokenPage,
          path: ':id/tokens/controller/:tokenid',
          element: (
            <>
              <UserTokenPage
                backTabLabel="Back to Automation Execution tokens"
                breadcrumbLabelForPreviousPage="Automation Execution tokens"
              />
              {newUserToken && (
                <UserTokenSecretsModal
                  onClose={setNewUserToken}
                  newToken={newUserToken}
                ></UserTokenSecretsModal>
              )}
            </>
          ),
          children: [
            {
              id: AwxRoute.UserTokenDetails,
              path: 'details',
              element: <UserTokenDetails />,
            },
            {
              path: '',
              element: <Navigate to="details" />,
            },
          ],
        },
        {
          id: PlatformRoute.AAPUserTokenPage,
          path: ':id/tokens/:tokenid',
          element: (
            <>
              <PlatformAAPUserTokenPage />
              {newUserToken && (
                <UserTokenSecretsModal
                  onClose={setNewUserToken}
                  newToken={newUserToken}
                ></UserTokenSecretsModal>
              )}
            </>
          ),
          children: [
            {
              id: PlatformRoute.AAPUserTokenDetails,
              path: 'details',
              element: <PlatformAAPUserTokenDetails />,
            },
            {
              path: '',
              element: <Navigate to="details" />,
            },
          ],
        },
        {
          id: PlatformRoute.AwxUserAddRoles,
          path: ':id/roles/controller/add-roles',
          element: (
            <PlatformAwxUserIdLookup>
              <AddRolesToUser userRolesRoute={PlatformRoute.AwxUserRoles} />
            </PlatformAwxUserIdLookup>
          ),
        },
        {
          id: PlatformRoute.EdaUserAddRoles,
          path: ':id/roles/eda/add-roles',
          element: (
            <PlatformEdaUserIdLookup>
              <EdaAddUserRoles userRolesRoute={PlatformRoute.EdaUserRoles} />
            </PlatformEdaUserIdLookup>
          ),
        },
        {
          id: PlatformRoute.HubUserAddRoles,
          path: ':id/roles/hub/add-roles',
          element: (
            <PlatformHubUserIdLookup>
              <HubAddUserRoles userRolesRoute={PlatformRoute.HubUserRoles} />
            </PlatformHubUserIdLookup>
          ),
        },
        {
          path: '',
          element: <PlatformUsersList />,
        },
      ],
    }),
    [newUserToken, t]
  );
  return usersRoutes;
}
