import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, TextCell, compareStrings } from '../../../../../framework';
import { requestDelete } from '../../../../common/crud/Data';
import { useEdaBulkConfirmation } from '../../../common/useEdaBulkConfirmation';
import { useRoleColumns } from './useRoleColumns';
import { EdaRbacRole } from '../../../interfaces/EdaRbacRole';
import { useEdaActiveUser } from '../../../common/useEdaActiveUser';
import { edaAPI } from '../../../common/eda-utils';
import { idKeyFn } from '../../../../common/utils/nameKeyFn';

export function useDeleteEdaRoles(onComplete: (roles: EdaRbacRole[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useRoleColumns({ disableLinks: true, disableSort: true });
  const actionColumns = useMemo<ITableColumn<EdaRbacRole>[]>(
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
  const { activeEdaUser } = useEdaActiveUser();
  const bulkAction = useEdaBulkConfirmation<EdaRbacRole>();
  const cannotDeleteBuiltInRole = (role: EdaRbacRole) =>
    role.managed ? t('Built-in roles cannot be deleted.') : '';
  const cannotDeleteRoleDueToPermissions = () =>
    activeEdaUser?.is_superuser
      ? ''
      : t(
          'You do not have permission to edit this role. Please contact your organization administrator if there is an issue with your access.'
        );

  const deleteRoles = (roles: EdaRbacRole[]) => {
    const undeletableBuiltInRoles: EdaRbacRole[] = roles.filter((role) => role.managed);
    const editableRoles: EdaRbacRole[] = roles.filter((role) => !role.managed);
    const undeletableRolesDueToPermissions: EdaRbacRole[] = editableRoles.filter(
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
      isItemNonActionable: (role: EdaRbacRole) =>
        cannotDeleteBuiltInRole(role)
          ? cannotDeleteBuiltInRole(role)
          : cannotDeleteRoleDueToPermissions(),
      keyFn: idKeyFn,
      isDanger: true,
      confirmationColumns,
      actionColumns,
      onComplete,
      actionFn: (role, signal) =>
        requestDelete(edaAPI`/role_definitions/${role.id.toString()}/`, signal),
    });
  };
  return deleteRoles;
}
