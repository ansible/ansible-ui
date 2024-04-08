import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, TextCell, compareStrings } from '../../../../../framework';
import { requestDelete } from '../../../../common/crud/Data';
import { pulpAPI } from '../../../common/api/formatPath';
import { parsePulpIDFromURL } from '../../../common/api/hub-api-utils';
import { useHubBulkConfirmation } from '../../../common/useHubBulkConfirmation';
import { useHubContext } from '../../../common/useHubContext';
import { Role } from '../Role';
import { useRoleColumns } from './useRoleColumns';

export function useDeleteRoles(onComplete: (roles: Role[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useRoleColumns({ disableLinks: true, disableSort: true });
  const actionColumns = useMemo<ITableColumn<Role>[]>(
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
  const bulkAction = useHubBulkConfirmation<Role>();
  const cannotDeleteBuiltInRole = (role: Role) =>
    role.locked ? t('Built-in roles cannot be deleted.') : '';
  const cannotDeleteRoleDueToPermissions = () =>
    user?.is_superuser
      ? ''
      : t(
          'You do not have permission to edit this role. Please contact your organization administrator if there is an issue with your access.'
        );

  const deleteRoles = (roles: Role[]) => {
    const undeletableBuiltInRoles: Role[] = roles.filter((role) => role.locked);
    const editableRoles: Role[] = roles.filter((role) => !role.locked);
    const undeletableRolesDueToPermissions: Role[] = editableRoles.filter(
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
      isItemNonActionable: (role: Role) =>
        cannotDeleteBuiltInRole(role)
          ? cannotDeleteBuiltInRole(role)
          : cannotDeleteRoleDueToPermissions(),
      keyFn: (role) => role.pulp_href,
      isDanger: true,
      confirmationColumns,
      actionColumns,
      onComplete,
      actionFn: (role, signal) =>
        requestDelete(pulpAPI`/roles/${parsePulpIDFromURL(role.pulp_href)}/`, signal),
    });
  };
  return deleteRoles;
}
