import { PencilAltIcon, PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  useGetPageUrl,
} from '../../../../../framework';
import { HubRoute } from '../../../main/HubRoutes';
import { useDeleteRoles } from './useDeleteRoles';
import { ButtonVariant } from '@patternfly/react-core';
import { HubRbacRole } from '../../../interfaces/expanded/HubRbacRole';
import { useHubActiveUser } from '../../../common/useHubActiveUser';

export function useRoleToolbarActions(onComplete: (roles: HubRbacRole[]) => void) {
  const { t } = useTranslation();
  const { activeHubUser: user } = useHubActiveUser();
  const getPageUrl = useGetPageUrl();
  const deleteRoles = useDeleteRoles(onComplete);

  return useMemo<IPageAction<HubRbacRole>[]>(
    () => [
      {
        type: PageActionType.Link,
        selection: PageActionSelection.None,
        isPinned: true,
        icon: PlusCircleIcon,
        variant: ButtonVariant.primary,
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
        label: t('Delete roles'),
        onClick: deleteRoles,
        isDanger: true,
      },
    ],
    [deleteRoles, getPageUrl, t, user?.is_superuser]
  );
}

export function useRoleRowActions(onComplete: (roles: HubRbacRole[]) => void) {
  const { t } = useTranslation();
  const { activeHubUser: user } = useHubActiveUser();
  const deleteRoles = useDeleteRoles(onComplete);
  const getPageUrl = useGetPageUrl();

  return useMemo<IPageAction<HubRbacRole>[]>(
    () => [
      {
        type: PageActionType.Link,
        selection: PageActionSelection.Single,
        icon: PencilAltIcon,
        variant: ButtonVariant.primary,
        isPinned: true,
        label: t('Edit role'),
        isDisabled: (role) =>
          role.managed
            ? t('Built-in roles cannot be edited.')
            : user?.is_superuser
              ? undefined
              : t(
                  'You do not have permission to edit this role. Please contact your system administrator if there is an issue with your access.'
                ),
        href: (role) => {
          return getPageUrl(HubRoute.EditRole, {
            params: { id: role.id ?? '' },
          });
        },
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete role'),
        isDisabled: (role) =>
          role.managed
            ? t('Built-in roles cannot be deleted.')
            : user?.is_superuser
              ? undefined
              : t(
                  'You do not have permission to delete this role. Please contact your system administrator if there is an issue with your access.'
                ),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        onClick: (role) => deleteRoles([role]),
        isDanger: true,
      },
    ],
    [deleteRoles, getPageUrl, t, user?.is_superuser]
  );
}
