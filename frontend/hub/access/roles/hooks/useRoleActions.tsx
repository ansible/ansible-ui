import { useTranslation } from 'react-i18next';
import { Role } from '../Role';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  useGetPageUrl,
} from '../../../../../framework';
import { useMemo } from 'react';
import { PencilAltIcon, PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useHubContext } from '../../../useHubContext';
import { HubRoute } from '../../../HubRoutes';
import { useDeleteRoles } from './useDeleteRoles';

export function useRoleToolbarActions(onComplete: (roles: Role[]) => void) {
  const { t } = useTranslation();
  const { user } = useHubContext();
  const getPageUrl = useGetPageUrl();
  const deleteRoles = useDeleteRoles(onComplete);

  return useMemo<IPageAction<Role>[]>(
    () => [
      {
        type: PageActionType.Link,
        selection: PageActionSelection.None,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Create role'),
        isDisabled: user?.is_superuser
          ? undefined
          : t(
              'You do not have permission to create a role. Please contact your system administrator if there is an issue with your access.'
            ),
        href: `${getPageUrl(HubRoute.CreateRole)}`,
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected roles'),
        onClick: deleteRoles,
        isDanger: true,
      },
    ],
    [deleteRoles, getPageUrl, t, user?.is_superuser]
  );
}

export function useRoleRowActions(onComplete: (roles: Role[]) => void) {
  const { t } = useTranslation();
  const { user } = useHubContext();
  const deleteRoles = useDeleteRoles(onComplete);

  return useMemo<IPageAction<Role>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: PencilAltIcon,
        isPinned: true,
        label: t('Edit role'),
        isDisabled: (role) =>
          role.locked
            ? t('Built-in roles cannot be edited.')
            : user.is_superuser
            ? undefined
            : t(
                'You do not have permission to edit this role. Please contact your organization administrator if there is an issue with your access.'
              ),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        onClick: (role) => alert('TODO'),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete role'),
        isDisabled: (role) =>
          role.locked
            ? t('Built-in roles cannot be deleted.')
            : user?.is_superuser
            ? undefined
            : t(
                'You do not have permission to delete this role. Please contact your organization administrator if there is an issue with your access.'
              ),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        onClick: (role) => deleteRoles([role]),
        isDanger: true,
      },
    ],
    [deleteRoles, t, user?.is_superuser]
  );
}
