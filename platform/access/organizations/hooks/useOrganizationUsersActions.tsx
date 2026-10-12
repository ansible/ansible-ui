import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  useGetPageUrl,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { ActionsResponse, OptionsResponse } from '@ansible/awx-ui/interfaces/OptionsResponse';
import { UserRoleAccess } from '@ansible/common-ui/access/interfaces/UserRoleAccess';
import { useGetItem } from '@ansible/common-ui/crud/useGet';
import { useOptions } from '@ansible/common-ui/crud/useOptions';
import { ButtonVariant } from '@patternfly/react-core';
import { MinusCircleIcon, PencilAltIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { IPlatformView } from '../../../hooks/usePlatformView';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { useRemoveOrganizationUsers } from './useRemoveOrganizationUsers';

export function useOrganizationUsersToolbarActions(view: IPlatformView<UserRoleAccess>) {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const pageNavigate = usePageNavigate();
  const { data: organization } = useGetItem<PlatformOrganization>(
    gatewayAPI`/organizations`,
    params.id
  );
  const { data: organizationOptions } = useOptions<OptionsResponse<ActionsResponse>>(
    gatewayAPI`/organizations/${organization?.id?.toString() ?? ''}/`
  );

  const canEditOrganization = useMemo(
    () =>
      Boolean(
        organizationOptions?.actions &&
          (organizationOptions.actions['PUT'] || organizationOptions.actions['PATCH'])
      ),
    [organizationOptions?.actions]
  );

  const removeUsers = useRemoveOrganizationUsers(view.unselectItemsAndRefresh);

  const toolbarActions = useMemo<IPageAction<UserRoleAccess>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Assign users'),
        isDisabled: canEditOrganization
          ? undefined
          : t(
              'You do not have permission to add users to this organization. Please contact your system administrator if there is an issue with your access.'
            ),
        onClick: () => {
          pageNavigate(PlatformRoute.OrganizationAssignUsers, {
            params: { id: params.id },
          });
        },
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: MinusCircleIcon,
        label: t('Remove users'),
        isDisabled: canEditOrganization
          ? undefined
          : t(
              'You do not have permission to remove users from this organization. Please contact your system administrator if there is an issue with your access.'
            ),
        onClick: removeUsers,
        isDanger: true,
      },
    ],
    [t, canEditOrganization, removeUsers, pageNavigate, params.id]
  );

  return toolbarActions;
}

export function useOrganizationUsersRowActions(view: IPlatformView<UserRoleAccess>) {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: organization } = useGetItem<PlatformOrganization>(
    gatewayAPI`/organizations`,
    params.id
  );

  const getPageUrl = useGetPageUrl();

  const removeUsers = useRemoveOrganizationUsers(view.unselectItemsAndRefresh);
  const { data: organizationOptions } = useOptions<OptionsResponse<ActionsResponse>>(
    gatewayAPI`/organizations/${organization?.id?.toString() ?? ''}/`
  );
  const canEditOrganization = Boolean(
    organizationOptions?.actions &&
      (organizationOptions.actions['PUT'] || organizationOptions.actions['PATCH'])
  );

  const rowActions = useMemo<IPageAction<UserRoleAccess>[]>(() => {
    return [
      {
        type: PageActionType.Link,
        selection: PageActionSelection.Single,
        variant: ButtonVariant.secondary,
        isPinned: true,
        icon: PencilAltIcon,
        label: t(`Manage organization roles`),
        href: (user: UserRoleAccess) =>
          getPageUrl(PlatformRoute.OrganizationManageUserRoles, {
            params: {
              id: organization?.id,
              userId: user.id,
            },
          }),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: MinusCircleIcon,
        label: t('Remove user'),
        isDisabled: canEditOrganization
          ? ''
          : t(`The user cannot be removed due to insufficient permissions.`),
        onClick: (user) => removeUsers([user]),
        isDanger: true,
      },
    ];
  }, [canEditOrganization, removeUsers, getPageUrl, organization?.id, t]);

  return rowActions;
}
