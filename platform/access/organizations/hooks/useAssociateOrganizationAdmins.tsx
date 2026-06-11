import { useGet, useGetItem } from '@ansible/common-ui/crud/useGet';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PlatformItemsResponse } from '../../../interfaces/PlatformItemsResponse';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { PlatformRole } from '../../../interfaces/PlatformRole';
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
  const { data: organizationAdminRoleData } = useGet<PlatformItemsResponse<PlatformRole>>(
    gatewayAPI`/role_definitions/`,
    {
      name: 'Organization Admin',
    }
  );
  const associateUsers = useCallback(() => {
    selectUsers(
      t('Add administrators'),
      t('Select users below to be added to this organization as administrators.'),
      t('Add administrators'),
      async (users: PlatformUser[]) => {
        if (!organization) return;
        await Promise.all(
          users.map((user) =>
            postRequest(gatewayAPI`/role_user_assignments/`, {
              object_id: organization?.id,
              role_definition: organizationAdminRoleData?.results[0]?.id,
              user: user?.id,
            })
          )
        );
        await onComplete();
      }
    );
  }, [selectUsers, t, organization, onComplete, postRequest, organizationAdminRoleData?.results]);
  return associateUsers;
}
