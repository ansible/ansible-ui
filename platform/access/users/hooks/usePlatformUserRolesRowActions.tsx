import { IPageAction, PageActionSelection, PageActionType } from '@ansible/ansible-ui-framework';
import { MinusCircleIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { UserAssignment } from '@ansible/common-ui/access/interfaces/UserAssignment';
import { OptionsResponse, ActionsResponse } from '@ansible/awx-ui/interfaces/OptionsResponse';
import { useGetItem } from '@ansible/common-ui/crud/useGet';
import { useOptions } from '@ansible/common-ui/crud/useOptions';
import { useParams } from 'react-router';
import { IPlatformView } from '../../../hooks/usePlatformView';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { useRemoveUserRoleAssignments } from './useRemoveUserRoleAssignments';
import { PlatformUser } from '../../../interfaces/PlatformUser';

export function usePlatformUserRolesRowActions(view: IPlatformView<UserAssignment>) {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: user } = useGetItem<PlatformUser>(gatewayAPI`/users`, params.id);
  const { data: userOptions } = useOptions<OptionsResponse<ActionsResponse>>(
    gatewayAPI`/users/${user?.id?.toString() ?? ''}/`
  );
  const canEditUser = Boolean(
    userOptions?.actions && (userOptions.actions['PUT'] || userOptions.actions['PATCH'])
  );
  const removeUserRoles = useRemoveUserRoleAssignments(view.unselectItemsAndRefresh);

  const rowActions = useMemo<IPageAction<UserAssignment>[]>(() => {
    return [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: MinusCircleIcon,
        isPinned: true,
        label: t('Remove role'),
        isDisabled: canEditUser
          ? ''
          : t(`The role cannot be removed due to insufficient permissions.`),
        onClick: (role) => removeUserRoles([role]),
        isDanger: true,
      },
    ];
  }, [canEditUser, t, removeUserRoles]);

  return rowActions;
}
