import { TextCell, compareStrings, useBulkConfirmation } from '@ansible/ansible-ui-framework';
import { UserAssignment } from '@ansible/common-ui/access/interfaces/UserAssignment';
import { UserRoleAccess } from '@ansible/common-ui/access/interfaces/UserRoleAccess';
import { getItemKey } from '@ansible/common-ui/crud/Data';
import { useDeleteRequest } from '@ansible/common-ui/crud/useDeleteRequest';
import { useGetItem, useGetRequest } from '@ansible/common-ui/crud/useGet';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PlatformItemsResponse } from '../../../interfaces/PlatformItemsResponse';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { useOrganizationUserColumns } from '../../users/hooks/useOrganizationUserColumns';

export function useRemoveOrganizationUsers(onComplete: (users: UserRoleAccess[]) => void) {
  const { t } = useTranslation();
  const getRequest = useGetRequest<PlatformItemsResponse<UserAssignment>>();
  const deleteRequest = useDeleteRequest();
  const params = useParams<{ id: string }>();
  const { data: organization } = useGetItem<PlatformOrganization>(
    gatewayAPI`/organizations`,
    params.id
  );
  const confirmationColumns = useOrganizationUserColumns({ disableLinks: true });
  const removeActionNameColumn = useMemo(
    () => ({
      header: t('Username'),
      cell: (user: UserRoleAccess) => <TextCell text={user?.username} />,
      sort: 'username',
      maxWidth: 200,
    }),
    [t]
  );
  const actionColumns = useMemo(() => [removeActionNameColumn], [removeActionNameColumn]);

  const bulkAction = useBulkConfirmation<UserRoleAccess>();
  const removeUsers = (users: UserRoleAccess[]) => {
    bulkAction({
      title: t('Remove users from organization', { count: users.length }),
      prompt: (
        <>
          {t('Are you sure you want to remove the user below?')}
          <br />
          <br />
          <strong>{t('Note:', 'Note:')}</strong>{' '}
          {t(
            'This will remove all directly assigned organization roles for this user. ' +
              'If the user has indirectly assigned roles through a team assignment, they cannot be managed here. ' +
              'To modify roles assigned to the user from a team assignment manage the teams assignments or remove the user from the team.'
          )}
        </>
      ),
      confirmText: t(
        'Yes, I confirm that I want to remove these {{count}} users from the organization.',
        {
          count: users.length,
        }
      ),
      actionButtonText: t('Remove users', { count: users.length }),
      items: users.sort((l, r) => compareStrings(l.username, r.username)),
      keyFn: getItemKey,
      isDanger: true,
      confirmationColumns: confirmationColumns,
      actionColumns,
      onComplete,
      actionFn: async (user: UserRoleAccess) => {
        const orgMemberRoleAssignments = await getRequest(gatewayAPI`/role_user_assignments/`, {
          user: user?.id,
          object_id: organization?.id ?? '',
        });

        await Promise.all(
          orgMemberRoleAssignments?.results?.map(async (assignment) => {
            await deleteRequest(gatewayAPI`/role_user_assignments/${assignment.id}/`);
          })
        );
      },
    });
  };
  return removeUsers;
}
