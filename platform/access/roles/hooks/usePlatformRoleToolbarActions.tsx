import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  useGetPageUrl,
} from '@ansible/ansible-ui-framework';
import { ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PlatformRole } from '../../../interfaces/PlatformRole';
import { useDeletePlatformRoles } from './useDeletePlatformRoles';
import { usePlatformActiveUser } from '@ansible/platform-ui/main/PlatformActiveUserProvider';
import { PlatformRoute } from '@ansible/platform-ui/main/PlatformRoutes';

export function usePlatformRoleToolbarActions(onComplete: (roles: PlatformRole[]) => void) {
  const { t } = useTranslation();
  const { activePlatformUser } = usePlatformActiveUser();
  const getPageUrl = useGetPageUrl();
  const deleteRoles = useDeletePlatformRoles(onComplete);

  return useMemo<IPageAction<PlatformRole>[]>(
    () => [
      {
        type: PageActionType.Link,
        selection: PageActionSelection.None,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Create role'),
        isDisabled: activePlatformUser?.is_superuser
          ? undefined
          : t(
              'You do not have permission to create a role. Please contact your system administrator if there is an issue with your access.'
            ),
        href: `${getPageUrl(PlatformRoute.CreateRole)}`,
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
    [deleteRoles, getPageUrl, t, activePlatformUser?.is_superuser]
  );
}
