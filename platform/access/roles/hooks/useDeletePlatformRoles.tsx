import {
  ITableColumn,
  TextCell,
  compareStrings,
  useBulkConfirmation,
} from '@ansible/ansible-ui-framework';
import { requestDelete } from '@ansible/common-ui/crud/Data';
import { idKeyFn } from '@ansible/common-ui/utils/nameKeyFn';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PlatformRole } from '../../../interfaces/PlatformRole';
import { usePlatformActiveUser } from '../../../main/PlatformActiveUserProvider';
import { usePlatformRoleColumns } from './usePlatformRoleColumns';
import { gatewayAPI } from '@ansible/platform-ui/utils/gateway-api-utils';

export function useDeletePlatformRoles(onComplete: (roles: PlatformRole[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = usePlatformRoleColumns({ disableLinks: true, disableSort: true });
  const actionColumns = useMemo<ITableColumn<PlatformRole>[]>(
    () => [
      {
        header: t('Name'),
        cell: (role) => <TextCell text={role.name} />,
        card: 'name',
        list: 'name',
      },
    ],
    [t]
  );
  const { activePlatformUser } = usePlatformActiveUser();
  const bulkAction = useBulkConfirmation<PlatformRole>();
  const cannotDeleteBuiltInRole = (role: PlatformRole) =>
    role.managed ? t('Built-in roles cannot be deleted.') : '';
  const cannotDeleteRoleDueToPermissions = () =>
    activePlatformUser?.is_superuser
      ? ''
      : t(
          'You do not have permission to edit this role. Please contact your organization administrator if there is an issue with your access.'
        );

  const deleteRoles = (roles: PlatformRole[]) => {
    const undeletableBuiltInRoles: PlatformRole[] = roles.filter((role) => role.managed);
    const editableRoles: PlatformRole[] = roles.filter((role) => !role.managed);
    const undeletableRolesDueToPermissions: PlatformRole[] = editableRoles.filter(
      cannotDeleteRoleDueToPermissions
    );

    bulkAction({
      title: t('Permanently delete roles', { count: roles.length }),
      confirmText: t('Yes, I confirm that I want to delete these {{count}} roles.', {
        count:
          roles.length - undeletableBuiltInRoles.length - undeletableRolesDueToPermissions.length,
      }),
      actionButtonText: t('Delete roles', {
        count:
          roles.length - undeletableBuiltInRoles.length - undeletableRolesDueToPermissions.length,
      }),
      items: roles.sort((l, r) => compareStrings(l.name, r.name)),
      alertPrompts:
        undeletableBuiltInRoles.length || undeletableRolesDueToPermissions.length
          ? [
              ...(undeletableBuiltInRoles.length
                ? [
                    t(
                      '{{count}} of the selected roles cannot be deleted because they are built-in.',
                      {
                        count: undeletableBuiltInRoles.length,
                      }
                    ),
                  ]
                : []),
              ...(undeletableRolesDueToPermissions.length
                ? [
                    t(
                      '{{count}} of the selected roles cannot be deleted due to insufficient permissions.',
                      {
                        count: undeletableRolesDueToPermissions.length,
                      }
                    ),
                  ]
                : []),
            ]
          : undefined,
      isItemNonActionable: (role: PlatformRole) =>
        cannotDeleteBuiltInRole(role)
          ? cannotDeleteBuiltInRole(role)
          : cannotDeleteRoleDueToPermissions(),
      keyFn: idKeyFn,
      isDanger: true,
      confirmationColumns,
      actionColumns,
      onComplete,
      actionFn: (role, signal) =>
        requestDelete(gatewayAPI`/role_definitions/${role.id.toString()}/`, signal),
    });
  };
  return deleteRoles;
}
