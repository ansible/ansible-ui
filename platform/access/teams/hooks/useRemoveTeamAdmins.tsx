import { TextCell, compareStrings, useBulkConfirmation } from '@ansible/ansible-ui-framework';
import { getItemKey } from '@ansible/common-ui/crud/Data';
import { useGet, useGetItem, useGetRequest } from '@ansible/common-ui/crud/useGet';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { useUsersColumns } from '../../users/hooks/useUserColumns';
import { PlatformItemsResponse } from '../../../interfaces/PlatformItemsResponse';
import { UserAssignment } from '@ansible/common-ui/access/interfaces/UserAssignment';
import { useDeleteRequest } from '@ansible/common-ui/crud/useDeleteRequest';
import { PlatformRole } from '../../../interfaces/PlatformRole';

export function useRemoveTeamAdmins(onComplete: (users: PlatformUser[]) => void) {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: team } = useGetItem<PlatformTeam>(gatewayAPI`/teams`, params.id);
  const { data: teamAdminRoleData } = useGet<PlatformItemsResponse<PlatformRole>>(
    gatewayAPI`/role_definitions/`,
    {
      name: 'Team Admin',
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
        'Yes, I confirm that I want to remove these {{count}} administrators from the team.',
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
        const teamMemberRoleAssignments = await getRequest(gatewayAPI`/role_user_assignments/`, {
          user: user?.id,
          object_id: team?.id ?? '',
          role_definition: `${teamAdminRoleData?.results[0]?.id}`,
        });

        await Promise.all(
          teamMemberRoleAssignments?.results?.map(async (assignment) => {
            await deleteRequest(gatewayAPI`/role_user_assignments/${assignment?.id}/`);
          })
        );
      },
    });
  };
  return removeAdmins;
}
