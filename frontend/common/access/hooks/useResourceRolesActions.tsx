import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { PencilAltIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

export interface RoleAccess {
  id: string;
  url: string;
  related: {
    details: string;
  };
  username: string;
  is_superuser: false;
  object_role_assignments: [
    {
      type: string;
      role_definition: {
        name: string;
        url: string;
      };
    },
    {
      type: 'direct';
      role_definition: {
        name: string;
        url: string;
      };
    },
  ];
}

export function useResourceRolesActions(manageRolesRoute: string) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();

  return useMemo<IPageAction<RoleAccess>[]>(() => {
    return [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        isPinned: true,
        icon: PencilAltIcon,
        label: t('Manage roles'),
        onClick: (roleAccess) => {
          const roleArray = roleAccess?.related?.details?.split('/');
          return pageNavigate(manageRolesRoute, {
            params: {
              resource_type: roleArray?.length >= 4 ? roleArray[roleArray.length - 4] : undefined,
              resource_id: roleArray?.length >= 3 ? roleArray[roleArray.length - 3] : undefined,
              user_id: roleArray?.length >= 2 ? roleArray[roleArray.length - 2] : undefined,
            },
          });
        },
      },
    ];
  }, [manageRolesRoute, pageNavigate, t]);
}
