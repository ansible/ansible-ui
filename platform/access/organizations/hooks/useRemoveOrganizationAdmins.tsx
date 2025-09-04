import { TextCell, compareStrings, useBulkConfirmation } from '@ansible/ansible-ui-framework';
import { getItemKey } from '@ansible/common-ui/crud/Data';
import { useGet, useGetItem, useGetRequest } from '@ansible/common-ui/crud/useGet';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { useUsersColumns } from '../../users/hooks/useUserColumns';
import { PlatformItemsResponse } from '../../../interfaces/PlatformItemsResponse';
import { UserAssignment } from '@ansible/common-ui/access/interfaces/UserAssignment';
import { useDeleteRequest } from '@ansible/common-ui/crud/useDeleteRequest';
import { PlatformRole } from '../../../interfaces/PlatformRole';

export function useRemoveOrganizationAdmins(onComplete: (users: PlatformUser[]) => void) {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: organization } = useGetItem<PlatformOrganization>(
    gatewayAPI`/organizations`,
    params.id
  );
  const { data: orgAdminRoleData } = useGet<PlatformItemsResponse<PlatformRole>>(
    gatewayAPI`/role_definitions/`,
    {
      name: 'Organization Admin',
    }
  );
  const confirmationColumns = useUsersColumns({ disableLinks: true });
  const removeActionNameColumn = useMemo(
    () => ({
      header: t('Username'),
      cell: (user: PlatformUser) => <TextCell text={user?.username} />,
      sort: 'username',
      maxWidth: 200,
    }),
    [t]
  );
  const actionColumns = useMemo(() => [removeActionNameColumn], [removeActionNameColumn]);

  const bulkAction = useBulkConfirmation<PlatformUser>();
  const getRequest = useGetRequest<PlatformItemsResponse<UserAssignment>>();
  const deleteRequest = useDeleteRequest();
  const removeAdmins = (users: PlatformUser[]) => {
    bulkAction({
      title: t('Remove administrators', { count: users.length }),
      confirmText: t(
        'Yes, I confirm that I want to remove these {{count}} administrators from the organization.',
        {
          count: users.length,
        }
      ),
      actionButtonText: t('Remove administrators', { count: users.length }),
      items: users.sort((l, r) => compareStrings(l.username, r.username)),
      keyFn: getItemKey,
      isDanger: true,
      confirmationColumns: confirmationColumns,
      actionColumns,
      onComplete,
      actionFn: async (user: PlatformUser) => {
        const orgAdminRoleAssignments = await getRequest(gatewayAPI`/role_user_assignments/`, {
          user: user?.id,
          object_id: organization?.id ?? '',
          role_definition: `${orgAdminRoleData?.results[0]?.id}`,
        });

        await Promise.all(
          orgAdminRoleAssignments?.results?.map(async (assignment) => {
            await deleteRequest(gatewayAPI`/role_user_assignments/${assignment?.id}/`);
          })
        );
      },
    });
  };
  return removeAdmins;
}
