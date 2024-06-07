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
import { PlatformUserTokens } from '../access/users/components/PlatformUserTokens';
import { UserTokens } from '../../frontend/awx/access/users/UserPage/UserTokens';
import { Token } from '../../frontend/awx/interfaces/Token';
import { CreateUserToken } from '../../frontend/awx/access/users/UserTokenForm';
import { AwxRoute } from '../../frontend/awx/main/AwxRoutes';
import { UserTokenPage } from '../../frontend/awx/access/users/UserPage/UserTokenPage';
import { UserTokenSecretsModal } from '../../frontend/awx/access/users/UserPage/UserTokenSecretsModal';
import { UserTokenDetails } from '../../frontend/awx/access/users/UserPage/UserTokenDetails';
import { ControllerTokens } from '../../frontend/eda/access/users/UserPage/ControllerTokens';
import { CreateControllerToken } from '../../frontend/eda/access/users/CreateControllerToken';
import { AAPUserTokens } from '../access/users/components/PlatformAAPUserTokens';
import { CreateAAPUserToken } from '../access/users/components/PlatformAAPUserTokenForm';
import { PlatformAAPUserTokenDetails } from '../access/users/components/PlatformAAPUserTokenDetails';
import { PlatformAAPUserTokenPage } from '../access/users/components/PlatformAAPUserTokenPage';

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
                  path: '',
                  element: <Navigate to="controller" />,
                },
              ],
            },
            {
              id: PlatformRoute.UserTokens,
              path: 'tokens',
              element: <PlatformUserTokens />,
              children: [
                {
                  id: PlatformRoute.AAPUserTokens,
                  path: 'platform',
                  element: (
                    <AAPUserTokens
                      infoMessage={t(
                        'Ansible Automation Platform tokens authenticate your instance to run automation.'
                      )}
                    />
                  ),
                },
                {
                  id: PlatformRoute.AwxUserTokens,
                  path: 'controller',
                  element: (
                    <PlatformAwxUserIdLookup>
                      <UserTokens
                        infoMessage={t(
                          'Automation Execution tokens authenticate and connect to your Ansible Automation Platform to run automation.'
                        )}
                        createTokenRoute={PlatformRoute.CreateAwxUserToken}
                      />
                    </PlatformAwxUserIdLookup>
                  ),
                },
                {
                  id: PlatformRoute.EdaUserTokens,
                  path: 'eda',
                  element: (
                    <PlatformEdaUserIdLookup>
                      <ControllerTokens
                        createTokenRoute={PlatformRoute.CreateEdaControllerToken}
                        infoMessage={t(
                          'Automation Decisions tokens authenticate and connect to your Ansible Automation Platform to run automation.'
                        )}
                        createTokenButtonLabel="Add Automation Execution token"
                        emptyStateTitle="No Automation Execution tokens"
                        emptyStateDescription=" To use Automation Decisions to run rulebook activations, create an Automation Execution token and paste it into the form when adding a token by using the button below."
                      />
                    </PlatformEdaUserIdLookup>
                  ),
                },
                {
                  path: '',
                  element: <Navigate to="platform" />,
                },
              ],
            },
            {
              path: '',
              element: <Navigate to="details" />,
            },
          ],
        },
        {
          id: PlatformRoute.CreateAapUserToken,
          path: ':id/tokens/platform/create',
          element: <CreateAAPUserToken onSuccessfulCreate={(t: Token) => setNewUserToken(t)} />,
        },
        {
          id: PlatformRoute.CreateAwxUserToken,
          path: ':id/tokens/controller/create',
          element: <CreateUserToken onSuccessfulCreate={(t: Token) => setNewUserToken(t)} />,
        },
        {
          // this route does not have :id in path because the upstream component does not use it
          id: PlatformRoute.CreateEdaControllerToken,
          path: 'tokens/eda/create',
          element: <CreateControllerToken />,
        },
        {
          id: AwxRoute.UserTokenPage,
          path: ':id/tokens/controller/:tokenid',
          element: (
            <>
              <UserTokenPage
                backTabLabel="Back To Automation Execution tokens"
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
          path: ':id/tokens/platform/:tokenid',
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
            <PlatformEdaUserIdLookup>
              <AddRolesToUser userRolesRoute={PlatformRoute.AwxUserRoles} />
            </PlatformEdaUserIdLookup>
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
          path: '',
          element: <PlatformUsersList />,
        },
      ],
    }),
    [newUserToken, t]
  );
  return usersRoutes;
}
