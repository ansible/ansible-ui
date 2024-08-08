import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, TextCell, compareStrings } from '../../../../../framework';
import { requestDelete } from '../../../../common/crud/Data';
import { hubAPI } from '../../../common/api/formatPath';
import { useHubBulkConfirmation } from '../../../common/useHubBulkConfirmation';
import { useHubContext } from '../../../common/useHubContext';
import { useRoleColumns } from './useRoleColumns';
import { HubRbacRole } from '../../../interfaces/expanded/HubRbacRole';

export function useDeleteRoles(onComplete: (roles: HubRbacRole[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useRoleColumns({ disableLinks: true, disableSort: true });
  const actionColumns = useMemo<ITableColumn<HubRbacRole>[]>(
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
  const { user } = useHubContext();
  const bulkAction = useHubBulkConfirmation<HubRbacRole>();
  const cannotDeleteBuiltInRole = (role: HubRbacRole) =>
    role.managed ? t('Built-in roles cannot be deleted.') : '';
  const cannotDeleteRoleDueToPermissions = () =>
    user?.is_superuser
      ? ''
      : t(
          'You do not have permission to delete this role. Please contact your system administrator if there is an issue with your access.'
        );

  const deleteRoles = (roles: HubRbacRole[]) => {
    const undeletableBuiltInRoles: HubRbacRole[] = roles.filter((role) => role.managed);
    const editableRoles: HubRbacRole[] = roles.filter((role) => !role.managed);
    const undeletableRolesDueToPermissions: HubRbacRole[] = editableRoles.filter(
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
      isItemNonActionable: (role: HubRbacRole) =>
        cannotDeleteBuiltInRole(role)
          ? cannotDeleteBuiltInRole(role)
          : cannotDeleteRoleDueToPermissions(),
      keyFn: (role) => role.id,
      isDanger: true,
      confirmationColumns,
      actionColumns,
      onComplete,
      actionFn: (role, signal) =>
        requestDelete(hubAPI`/_ui/v2/role_definitions/${role.id.toString()}/`, signal),
    });
  };
  return deleteRoles;
}
