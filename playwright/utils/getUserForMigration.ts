import { APIRequestContext } from '@playwright/test';
import { PlatformItemsResponse } from '../../platform/interfaces/PlatformItemsResponse';
import { PlatformUser } from '../../platform/interfaces/PlatformUser';
import { gatewayAPI } from '../../platform/utils/gateway-api-utils';
import { platformUI } from '../commands/login';
import { UpgradeUserType, usersForMigration } from './constants';

/**
 * Sets environment variables with the credentials username and password) of an unmigrated user for testing upgrades
 * Note: Must be logged in as a system administrator
 * Usage:
 *    await getUserForMigration({
 *      userType: UpgradeUserType.hubKeycloak,
 *      request: page.request,
 *      usernameVariableName: 'KEYCLOAK_USERNAME',
 *      passwordVariableName: 'KEYCLOAK_PASSWORD',
 *    });
 */
export async function getUserForMigration(options: {
  userType: UpgradeUserType;
  request: APIRequestContext;
}) {
  const users = usersForMigration[options.userType];

  if (!users?.length) {
    throw new Error('There are no unlinked users available for testing!');
  }

  async function getAvailableUser(index: number) {
    if (index === users.length) {
      throw new Error('There are no unlinked users available for testing!');
    }
    const url = platformUI + gatewayAPI`/users/?username=${users[index]?.username}`;
    const response = await options.request.get(url);
    const result = (await response.json()) as PlatformItemsResponse<PlatformUser>;
    const platformUser = result?.results?.[0];
    if (platformUser?.last_login === null) {
      // This user has not been migrated yet and is available for testing upgrades
      return users[index];
    } else {
      return await getAvailableUser(index + 1);
    }
  }

  return await getAvailableUser(0);
}
