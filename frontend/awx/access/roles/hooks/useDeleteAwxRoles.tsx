import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, TextCell, compareStrings } from '../../../../../framework';
import { requestDelete } from '../../../../common/crud/Data';
import { useAwxBulkConfirmation } from '../../../common/useAwxBulkConfirmation';
import { useAwxRoleColumns } from './useAwxRoleColumns';
import { AwxRbacRole } from '../../../interfaces/AwxRbacRole';
import { useAwxActiveUser } from '../../../common/useAwxActiveUser';
import { awxAPI } from '../../../common/api/awx-utils';
import { idKeyFn } from '../../../../common/utils/nameKeyFn';

export function useDeleteAwxRoles(onComplete: (roles: AwxRbacRole[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useAwxRoleColumns({ disableLinks: true, disableSort: true });
  const actionColumns = useMemo<ITableColumn<AwxRbacRole>[]>(
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
  const { activeAwxUser } = useAwxActiveUser();
  const bulkAction = useAwxBulkConfirmation<AwxRbacRole>();
  const cannotDeleteBuiltInRole = (role: AwxRbacRole) =>
    role.managed ? t('Built-in roles cannot be deleted.') : '';
  const cannotDeleteRoleDueToPermissions = () =>
    activeAwxUser?.is_superuser
      ? ''
      : t(
          'You do not have permission to edit this role. Please contact your organization administrator if there is an issue with your access.'
        );

  const deleteRoles = (roles: AwxRbacRole[]) => {
    const undeletableBuiltInRoles: AwxRbacRole[] = roles.filter((role) => role.managed);
    const editableRoles: AwxRbacRole[] = roles.filter((role) => !role.managed);
    const undeletableRolesDueToPermissions: AwxRbacRole[] = editableRoles.filter(
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
      isItemNonActionable: (role: AwxRbacRole) =>
        cannotDeleteBuiltInRole(role)
          ? cannotDeleteBuiltInRole(role)
          : cannotDeleteRoleDueToPermissions(),
      keyFn: idKeyFn,
      isDanger: true,
      confirmationColumns,
      actionColumns,
      onComplete,
      actionFn: (role, signal) =>
        requestDelete(awxAPI`/role_definitions/${role.id.toString()}/`, signal),
    });
  };
  return deleteRoles;
}
