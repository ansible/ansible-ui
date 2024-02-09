import { useTranslation } from 'react-i18next';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { useMemo } from 'react';
import { TextCell, compareStrings, useBulkConfirmation } from '../../../../framework';
import { getItemKey, postRequest } from '../../../../frontend/common/crud/Data';
import { useUsersColumns } from '../../users/hooks/useUserColumns';
import { gatewayV1API } from '../../../api/gateway-api-utils';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { useParams } from 'react-router-dom';
import { useGetItem } from '../../../../frontend/common/crud/useGet';

export function useRemoveTeamAdmins(onComplete: (users: PlatformUser[]) => void) {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: team } = useGetItem<PlatformTeam>(gatewayV1API`/teams`, params.id);
  const confirmationColumns = useUsersColumns({ disableLinks: true });
  const removeActionNameColumn = useMemo(
    () => ({
      header: t('Username'),
      cell: (user: PlatformUser) => <TextCell text={user.username} />,
      sort: 'username',
      maxWidth: 200,
    }),
    [t]
  );
  const actionColumns = useMemo(() => [removeActionNameColumn], [removeActionNameColumn]);

  const bulkAction = useBulkConfirmation<PlatformUser>();
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
      confirmationColumns: confirmationColumns?.filter((column) =>
        [t('Username'), t('First name'), t('Last name')].includes(column.header)
      ),
      actionColumns,
      onComplete,
      actionFn: (user: PlatformUser, signal) =>
        postRequest(
          gatewayV1API`/teams/${team?.id?.toString() ?? ''}/admins/disassociate/`,
          { instances: [user.id.toString()] },
          signal
        ),
    });
  };
  return removeAdmins;
}
