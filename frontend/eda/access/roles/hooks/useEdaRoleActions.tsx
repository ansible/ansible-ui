import { PencilAltIcon, PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  useGetPageUrl,
} from '../../../../../framework';
import { useDeleteEdaRoles } from './useDeleteEdaRoles';
import { EdaRbacRole } from '../../../interfaces/EdaRbacRole';
import { EdaRoute } from '../../../main/EdaRoutes';
import { useEdaActiveUser } from '../../../common/useEdaActiveUser';
import { ButtonVariant } from '@patternfly/react-core';

export function useEdaRoleToolbarActions(onComplete: (roles: EdaRbacRole[]) => void) {
  const { t } = useTranslation();
  const { activeEdaUser } = useEdaActiveUser();
  const getPageUrl = useGetPageUrl();
  const deleteRoles = useDeleteEdaRoles(onComplete);

  return useMemo<IPageAction<EdaRbacRole>[]>(
    () => [
      {
        type: PageActionType.Link,
        selection: PageActionSelection.None,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Create role'),
        isDisabled: activeEdaUser?.is_superuser
          ? undefined
          : t(
              'You do not have permission to create a role. Please contact your system administrator if there is an issue with your access.'
            ),
        href: `${getPageUrl(EdaRoute.CreateRole)}`,
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
    [deleteRoles, getPageUrl, t, activeEdaUser?.is_superuser]
  );
}

export function useEdaRoleRowActions(onComplete: (roles: EdaRbacRole[]) => void) {
  const { t } = useTranslation();
  const { activeEdaUser } = useEdaActiveUser();
  const deleteRoles = useDeleteEdaRoles(onComplete);
  const getPageUrl = useGetPageUrl();

  return useMemo<IPageAction<EdaRbacRole>[]>(
    () => [
      {
        type: PageActionType.Link,
        selection: PageActionSelection.Single,
        icon: PencilAltIcon,
        isPinned: true,
        label: t('Edit role'),
        isDisabled: (role) =>
          role.managed
            ? t('Built-in roles cannot be edited.')
            : activeEdaUser?.is_superuser
              ? undefined
              : t(
                  'You do not have permission to edit this role. Please contact your organization administrator if there is an issue with your access.'
                ),
        href: (role) => {
          return getPageUrl(EdaRoute.EditRole, {
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
            : activeEdaUser?.is_superuser
              ? undefined
              : t(
                  'You do not have permission to delete this role. Please contact your organization administrator if there is an issue with your access.'
                ),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        onClick: (role) => deleteRoles([role]),
        isDanger: true,
      },
    ],
    [deleteRoles, getPageUrl, t, activeEdaUser?.is_superuser]
  );
}
