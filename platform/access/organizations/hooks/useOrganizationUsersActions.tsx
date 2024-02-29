import { useTranslation } from 'react-i18next';
import { useOptions } from '../../../../frontend/common/crud/useOptions';
import { IPlatformView } from '../../../hooks/usePlatformView';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import {
  ActionsResponse,
  OptionsResponse,
} from '../../../../frontend/awx/interfaces/OptionsResponse';
import { gatewayV1API } from '../../../api/gateway-api-utils';
import { useMemo } from 'react';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '../../../../framework';
import { ButtonVariant } from '@patternfly/react-core';
import { CogIcon, PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useGetItem } from '../../../../frontend/common/crud/useGet';
import { useParams } from 'react-router-dom';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { useRemoveOrganizationUsers } from './useRemoveOrganizationUsers';

export function useOrganizationUsersToolbarActions(view: IPlatformView<PlatformUser>) {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const pageNavigate = usePageNavigate();
  const { data: organization } = useGetItem<PlatformOrganization>(
    gatewayV1API`/organizations`,
    params.id
  );
  const { data: associateOptions } = useOptions<OptionsResponse<ActionsResponse>>(
    gatewayV1API`/organizations/${organization?.id?.toString() ?? ''}/users/associate/`
  );
  const { data: disassociateOptions } = useOptions<OptionsResponse<ActionsResponse>>(
    gatewayV1API`/organizations/${organization?.id?.toString() ?? ''}/users/disassociate/`
  );

  const canAssociateAdmin = useMemo(
    () => Boolean(associateOptions?.actions && associateOptions.actions['POST']),
    [associateOptions?.actions]
  );

  const canRemoveAdmin = Boolean(
    disassociateOptions?.actions && disassociateOptions.actions['POST']
  );
  const removeUsers = useRemoveOrganizationUsers(view.unselectItemsAndRefresh);

  const toolbarActions = useMemo<IPageAction<PlatformUser>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Add user(s)'),
        isDisabled: canAssociateAdmin
          ? undefined
          : t(
              'You do not have permission to add users to this organization. Please contact your system administrator if there is an issue with your access.'
            ),
        onClick: () => {
          pageNavigate(PlatformRoute.OrganizationAddUsers, {
            params: { id: params.id },
          });
        },
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Remove selected users'),
        isDisabled: canRemoveAdmin
          ? undefined
          : t(
              'You do not have permission to remove users from this organization. Please contact your system administrator if there is an issue with your access.'
            ),
        onClick: removeUsers,
        isDanger: true,
      },
    ],
    [t, canAssociateAdmin, canRemoveAdmin, removeUsers, pageNavigate, params.id]
  );

  return toolbarActions;
}

export function useOrganizationUsersRowActions(view: IPlatformView<PlatformUser>) {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: organization } = useGetItem<PlatformOrganization>(
    gatewayV1API`/organizations`,
    params.id
  );
  const removeUsers = useRemoveOrganizationUsers(view.unselectItemsAndRefresh);
  const { data: disassociateOptions } = useOptions<OptionsResponse<ActionsResponse>>(
    gatewayV1API`/organizations/${organization?.id?.toString() ?? ''}/admins/disassociate/`
  );
  const canRemoveAdmin = Boolean(
    disassociateOptions?.actions && disassociateOptions.actions['POST']
  );

  const rowActions = useMemo<IPageAction<PlatformUser>[]>(() => {
    return [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        variant: ButtonVariant.secondary,
        isPinned: true,
        icon: CogIcon,
        label: t(`Manage roles`),
        // isDisabled: // TODO
        onClick: () => alert('TODO'),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Remove user'),
        isDisabled: canRemoveAdmin
          ? ''
          : t(`The user cannot be removed due to insufficient permissions.`),
        onClick: (user) => removeUsers([user]),
        isDanger: true,
      },
    ];
  }, [canRemoveAdmin, removeUsers, t]);

  return rowActions;
}
