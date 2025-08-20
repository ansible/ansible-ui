import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { ActionsResponse, OptionsResponse } from '@ansible/awx-ui/interfaces/OptionsResponse';
import { UserAssignment } from '@ansible/common-ui/access/interfaces/UserAssignment';
import { useGetItem } from '@ansible/common-ui/crud/useGet';
import { useOptions } from '@ansible/common-ui/crud/useOptions';
import { ButtonVariant } from '@patternfly/react-core';
import { MinusCircleIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { IPlatformView } from '../../../hooks/usePlatformView';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { useRemoveUserRoleAssignments } from './useRemoveUserRoleAssignments';

export function usePlatformUserRolesToolbarActions(view: IPlatformView<UserAssignment>) {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const pageNavigate = usePageNavigate();
  const { data: user } = useGetItem<PlatformUser>(gatewayAPI`/users`, params.id);
  const { data: userOptions } = useOptions<OptionsResponse<ActionsResponse>>(
    gatewayAPI`/users/${user?.id?.toString() ?? ''}/`
  );
  const canEditUser = Boolean(
    userOptions?.actions && (userOptions.actions['PUT'] || userOptions.actions['PATCH'])
  );

  const removeUserRoles = useRemoveUserRoleAssignments(view.unselectItemsAndRefresh);
  const toolbarActions = useMemo<IPageAction<UserAssignment>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Assign roles'),
        isDisabled: canEditUser
          ? undefined
          : t(
              'You do not have permission to assign roles to this user. Please contact your system administrator if there is an issue with your access.'
            ),
        onClick: () => {
          pageNavigate(PlatformRoute.UserAssignRoles, { params: { id: params.id } });
        },
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: MinusCircleIcon,
        label: t('Remove roles'),
        isDisabled: canEditUser
          ? undefined
          : t(
              'You do not have permission to remove roles from this user. Please contact your system administrator if there is an issue with your access.'
            ),
        onClick: removeUserRoles,
        isDanger: true,
      },
    ],
    [t, canEditUser, pageNavigate, params.id, removeUserRoles]
  );

  return toolbarActions;
}
