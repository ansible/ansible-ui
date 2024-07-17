import { PencilAltIcon, PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  useGetPageUrl,
} from '../../../../../framework';
import { useDeleteAwxRoles } from './useDeleteAwxRoles';
import { AwxRbacRole } from '../../../interfaces/AwxRbacRole';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useAwxActiveUser } from '../../../common/useAwxActiveUser';
import { ButtonVariant } from '@patternfly/react-core';

export function useAwxRoleToolbarActions(onComplete: (roles: AwxRbacRole[]) => void) {
  const { t } = useTranslation();
  const { activeAwxUser } = useAwxActiveUser();
  const getPageUrl = useGetPageUrl();
  const deleteRoles = useDeleteAwxRoles(onComplete);

  return useMemo<IPageAction<AwxRbacRole>[]>(
    () => [
      {
        type: PageActionType.Link,
        selection: PageActionSelection.None,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Create role'),
        isDisabled: activeAwxUser?.is_superuser
          ? undefined
          : t(
              'You do not have permission to create a role. Please contact your system administrator if there is an issue with your access.'
            ),
        href: `${getPageUrl(AwxRoute.CreateRole)}`,
        variant: ButtonVariant.primary,
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
    [deleteRoles, getPageUrl, t, activeAwxUser?.is_superuser]
  );
}

export function useAwxRoleRowActions(onComplete: (roles: AwxRbacRole[]) => void) {
  const { t } = useTranslation();
  const { activeAwxUser } = useAwxActiveUser();
  const deleteRoles = useDeleteAwxRoles(onComplete);
  const getPageUrl = useGetPageUrl();

  return useMemo<IPageAction<AwxRbacRole>[]>(
    () => [
      {
        type: PageActionType.Link,
        selection: PageActionSelection.Single,
        icon: PencilAltIcon,
        isPinned: true,
        variant: ButtonVariant.primary,
        label: t('Edit role'),
        isDisabled: (role) =>
          role.managed
            ? t('Built-in roles cannot be edited.')
            : activeAwxUser?.is_superuser
              ? undefined
              : t(
                  'You do not have permission to edit this role. Please contact your organization administrator if there is an issue with your access.'
                ),
        href: (role) => {
          return getPageUrl(AwxRoute.EditRole, {
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
            : activeAwxUser?.is_superuser
              ? undefined
              : t(
                  'You do not have permission to delete this role. Please contact your organization administrator if there is an issue with your access.'
                ),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        onClick: (role) => deleteRoles([role]),
        isDanger: true,
      },
    ],
    [deleteRoles, getPageUrl, t, activeAwxUser?.is_superuser]
  );
}
