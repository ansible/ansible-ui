import { TextCell, compareStrings, useBulkConfirmation } from '@ansible/ansible-ui-framework';
import { getItemKey, postRequest } from '@ansible/common-ui/crud/Data';
import { useGetItem } from '@ansible/common-ui/crud/useGet';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { useUsersColumns } from '../../users/hooks/useUserColumns';

export function useRemoveTeamUsers(onComplete: (users: PlatformUser[]) => void) {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: team } = useGetItem<PlatformTeam>(gatewayAPI`/teams`, params.id);
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
  const removeUsers = (users: PlatformUser[]) => {
    bulkAction({
      title: t('Remove users', { count: users.length }),
      confirmText: t('Yes, I confirm that I want to remove these {{count}} users from the team.', {
        count: users.length,
      }),
      actionButtonText: t('Remove users', { count: users.length }),
      items: users.sort((l, r) => compareStrings(l.username, r.username)),
      keyFn: getItemKey,
      isDanger: true,
      confirmationColumns: confirmationColumns,
      actionColumns,
      onComplete,
      actionFn: (user: PlatformUser, signal) =>
        postRequest(
          gatewayAPI`/teams/${team?.id?.toString() ?? ''}/users/disassociate/`,
          { instances: [user?.id.toString()] },
          signal
        ),
    });
  };
  return removeUsers;
}
