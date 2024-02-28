import { useTranslation } from 'react-i18next';
import { useSelectUsers } from '../../users/hooks/useSelectUsers';
import { useCallback } from 'react';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { usePostRequest } from '../../../../frontend/common/crud/usePostRequest';
import { gatewayV1API } from '../../../api/gateway-api-utils';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { useParams } from 'react-router-dom';
import { useGetItem } from '../../../../frontend/common/crud/useGet';
import { requestGet } from '../../../../frontend/common/crud/Data';
import { PlatformItemsResponse } from '../../../interfaces/PlatformItemsResponse';

export function useAssociateTeamUsers(onComplete: () => Promise<void>) {
  const { t } = useTranslation();
  const selectUsers = useSelectUsers();
  const postRequest = usePostRequest();
  const params = useParams<{ id: string }>();
  const { data: team } = useGetItem<PlatformTeam>(gatewayV1API`/teams`, params.id);

  const associateUsers = useCallback(async () => {
    const teamUsers = await requestGet<PlatformItemsResponse<PlatformUser>>(
      gatewayV1API`/teams/${team?.id?.toString() ?? ''}/users/`
    );
    selectUsers(
      t('Add users'),
      t('Select users below to be added to this team'),
      t('Save'),
      async (users: PlatformUser[]) => {
        if (!team) return;
        await postRequest(gatewayV1API`/teams/${team?.id?.toString() ?? ''}/users/associate/`, {
          instances: users.map((user) => user.id.toString()),
        });
        await onComplete();
      },
      (user: PlatformUser) => !teamUsers?.results?.some((teamUser) => teamUser.id === user.id)
    );
  }, [onComplete, postRequest, selectUsers, t, team]);
  return associateUsers;
}
