import { useGet, useGetItem } from '@ansible/common-ui/crud/useGet';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PlatformItemsResponse } from '../../../interfaces/PlatformItemsResponse';
import { PlatformRole } from '../../../interfaces/PlatformRole';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { useSelectUsers } from '../../users/hooks/useSelectUsers';

export function useAssociateTeamAdmins(onComplete: () => Promise<void>) {
  const { t } = useTranslation();
  const selectUsers = useSelectUsers();
  const postRequest = usePostRequest();
  const params = useParams<{ id: string }>();
  const { data: team } = useGetItem<PlatformTeam>(gatewayAPI`/teams`, params.id);
  const { data: teamAdminRoleData } = useGet<PlatformItemsResponse<PlatformRole>>(
    gatewayAPI`/role_definitions/`,
    {
      name: 'Team Admin',
    }
  );
  const associateUsers = useCallback(() => {
    selectUsers(
      t('Add administrators'),
      t('Select users below to be added to this team as administrators.'),
      t('Add administrators'),
      async (users: PlatformUser[]) => {
        if (!team) return;
        await Promise.all(
          users.map((user) =>
            postRequest(gatewayAPI`/role_user_assignments/`, {
              object_id: team?.id,
              role_definition: teamAdminRoleData?.results[0]?.id,
              user: user?.id,
            })
          )
        );
        await onComplete();
      }
    );
  }, [onComplete, postRequest, selectUsers, t, team, teamAdminRoleData?.results]);
  return associateUsers;
}
