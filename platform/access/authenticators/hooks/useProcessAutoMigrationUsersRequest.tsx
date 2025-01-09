import { requestGet, requestPatch } from '@ansible/common-ui/crud/Data';
import { Authenticator } from '../../../interfaces/Authenticator';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { AwxItemsResponse } from '@ansible/awx-ui/common/AwxItemsResponse';
import { getAddedAndRemoved } from '@ansible/awx-ui/common/util/getAddedAndRemoved';
import { useCallback } from 'react';

export function useProcessAutoMigrationUsersRequest() {
  return useCallback(async function (
    updatedAuthenticator: Authenticator,
    selectedAuthenticator: number | Authenticator[] | null
  ) {
    if (updatedAuthenticator === undefined) {
      return;
    }
    return requestGet<AwxItemsResponse<Authenticator>>(
      gatewayAPI`/authenticators/?auto_migrate_users_to=${updatedAuthenticator?.id.toString() ?? ''}`
    ).then(async (res) => {
      const { added, removed } = getAddedAndRemoved(
        res.results || [],
        (selectedAuthenticator || []) as Authenticator[]
      );

      const isLegacy = updatedAuthenticator.type.includes('legacy');
      if (selectedAuthenticator === null && !removed.length) {
        // If the user unslects a updatedAuthenticator for the auto_migrate_users_to field we fall into this block
      } else if (isLegacy) {
        await Promise.all(
          removed.map(() =>
            requestPatch(
              gatewayAPI`/authenticators/${updatedAuthenticator.id?.toString() ?? ''}/`,
              {
                auto_migrate_users_to: null,
              }
            )
          )
        );
        return Promise.all(
          added.map((addedAuth) =>
            requestPatch(
              gatewayAPI`/authenticators/${updatedAuthenticator.id?.toString() ?? ''}/`,
              {
                auto_migrate_users_to: addedAuth.id,
              }
            )
          )
        );
      } else {
        await Promise.all(
          removed.map((removedAuth) =>
            requestPatch(gatewayAPI`/authenticators/${removedAuth.id?.toString() ?? ''}/`, {
              auto_migrate_users_to: null,
            })
          )
        );
        return Promise.all(
          added.map((addedAuth) =>
            requestPatch(gatewayAPI`/authenticators/${addedAuth.id?.toString() ?? ''}/`, {
              auto_migrate_users_to: updatedAuthenticator.id,
            })
          )
        );
      }
    });
  }, []);
}
