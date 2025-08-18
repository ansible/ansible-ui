import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  useGetPageUrl,
} from '@ansible/ansible-ui-framework';
import { ButtonVariant } from '@patternfly/react-core';
import { PencilAltIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PlatformRole } from '../../../interfaces/PlatformRole';
import { useDeletePlatformRoles } from './useDeletePlatformRoles';
import { usePlatformActiveUser } from '../../../main/PlatformActiveUserProvider';
import { PlatformRoute } from '../../../main/PlatformRoutes';

export function usePlatformRoleRowActions(onComplete: (roles: PlatformRole[]) => void) {
  const { t } = useTranslation();
  const { activePlatformUser } = usePlatformActiveUser();
  const deleteRoles = useDeletePlatformRoles(onComplete);
  const getPageUrl = useGetPageUrl();

  return useMemo<IPageAction<PlatformRole>[]>(() => {
    const deleteAllowed = (role: PlatformRole) => {
      if (role.managed) {
        return t('Built-in roles cannot be deleted.');
      } else if (!activePlatformUser?.is_superuser) {
        return t(
          'You do not have permission to delete this role. Please contact your organization administrator if there is an issue with your access.'
        );
      } else {
        return undefined;
      }
    };
    const editAllowed = (role: PlatformRole) => {
      if (role.managed) {
        return t('Built-in roles cannot be edited.');
      } else if (!activePlatformUser?.is_superuser) {
        return t(
          'You do not have permission to edit this role. Please contact your organization administrator if there is an issue with your access.'
        );
      } else {
        return undefined;
      }
    };
    return [
      {
        type: PageActionType.Link,
        selection: PageActionSelection.Single,
        icon: PencilAltIcon,
        isPinned: true,
        variant: ButtonVariant.primary,
        label: t('Edit role'),
        isDisabled: (role) => editAllowed(role),
        href: (role) => {
          return getPageUrl(PlatformRoute.EditRole, {
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
        isDisabled: (role) => deleteAllowed(role),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        onClick: (role) => deleteRoles([role]),
        isDanger: true,
      },
    ];
  }, [t, activePlatformUser?.is_superuser, getPageUrl, deleteRoles]);
}
