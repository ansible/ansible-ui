import { useGetItem } from '@ansible/common-ui/crud/useGet';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { useSelectUsers } from '../../users/hooks/useSelectUsers';

export function useAssociateOrganizationAdmins(onComplete: () => Promise<void>) {
  const { t } = useTranslation();
  const selectUsers = useSelectUsers();
  const postRequest = usePostRequest();
  const params = useParams<{ id: string }>();
  const { data: organization } = useGetItem<PlatformOrganization>(
    gatewayAPI`/organizations`,
    params.id
  );

  const associateUsers = useCallback(() => {
    selectUsers(
      t('Add administrators'),
      t('Select users below to be added to this organization as administrators.'),
      t('Add administrators'),
      async (users: PlatformUser[]) => {
        if (!organization) return;
        await postRequest(
          gatewayAPI`/organizations/${organization?.id?.toString() ?? ''}/admins/associate/`,
          {
            instances: users.map((user) => user?.id.toString()),
          }
        );
        await onComplete();
      }
    );
  }, [onComplete, postRequest, selectUsers, t, organization]);
  return associateUsers;
}
