import { useTranslation } from 'react-i18next';
import { useSelectUsers } from '../../users/hooks/useSelectUsers';
import { useCallback } from 'react';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { usePostRequest } from '../../../../frontend/common/crud/usePostRequest';
import { gatewayV1API } from '../../../api/gateway-api-utils';
import { useParams } from 'react-router-dom';
import { useGetItem } from '../../../../frontend/common/crud/useGet';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';

export function useAssociateOrganizationAdmins(onComplete: () => Promise<void>) {
  const { t } = useTranslation();
  const selectUsers = useSelectUsers();
  const postRequest = usePostRequest();
  const params = useParams<{ id: string }>();
  const { data: organization } = useGetItem<PlatformOrganization>(
    gatewayV1API`/organizations`,
    params.id
  );

  const associateUsers = useCallback(() => {
    selectUsers(
      t('Add administrators'),
      t('Select users below to be added to this organization as administrators.'),
      t('Save'),
      async (users: PlatformUser[]) => {
        if (!organization) return;
        await postRequest(
          gatewayV1API`/organizations/${organization?.id?.toString() ?? ''}/admins/associate/`,
          {
            instances: users.map((user) => user.id.toString()),
          }
        );
        await onComplete();
      }
    );
  }, [onComplete, postRequest, selectUsers, t, organization]);
  return associateUsers;
}
