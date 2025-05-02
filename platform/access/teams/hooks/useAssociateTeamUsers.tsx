import { useGetItem } from '@ansible/common-ui/crud/useGet';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { useSelectUsers } from '../../users/hooks/useSelectUsers';

export function useAssociateTeamUsers(onComplete: () => Promise<void>) {
  const { t } = useTranslation();
  const selectUsers = useSelectUsers();
  const postRequest = usePostRequest();
  const params = useParams<{ id: string }>();
  const { data: team } = useGetItem<PlatformTeam>(gatewayAPI`/teams`, params.id);

  const associateUsers = useCallback(() => {
    selectUsers(
      t('Add users'),
      t('Select users below to be added to this team'),
      t('Add users'),
      async (users: PlatformUser[]) => {
        if (!team) return;
        await postRequest(gatewayAPI`/teams/${team?.id?.toString() ?? ''}/users/associate/`, {
          instances: users.map((user) => user?.id.toString()),
        });
        await onComplete();
      }
    );
  }, [onComplete, postRequest, selectUsers, t, team]);
  return associateUsers;
}
