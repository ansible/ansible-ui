import { ButtonVariant } from '@patternfly/react-core';
import { CogIcon, PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '../../../../framework';
import { awxAPI } from '../../../../frontend/awx/common/api/awx-utils';
import {
  ActionsResponse,
  OptionsResponse,
} from '../../../../frontend/awx/interfaces/OptionsResponse';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { AwxUser } from '../../../../frontend/awx/interfaces/User';
import { useManageOrgRoles } from '../../../../frontend/common/access/hooks/useManageOrgRolesDialog';
import { useGetItem } from '../../../../frontend/common/crud/useGet';
import { useOptions } from '../../../../frontend/common/crud/useOptions';
import { edaAPI } from '../../../../frontend/eda/common/eda-utils';
import { EdaOrganization } from '../../../../frontend/eda/interfaces/EdaOrganization';
import { EdaUser } from '../../../../frontend/eda/interfaces/EdaUser';
import { gatewayV1API } from '../../../api/gateway-api-utils';
import { getAwxResource, useAwxResource } from '../../../hooks/useAwxResource';
import { getEdaResource, useEdaResource } from '../../../hooks/useEdaResource';
import { IPlatformView } from '../../../hooks/usePlatformView';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { useHasAwxService, useHasEdaService } from '../../../main/GatewayServices';
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

  const canAssociateUser = useMemo(
    () => Boolean(associateOptions?.actions && associateOptions.actions['POST']),
    [associateOptions?.actions]
  );

  const canRemoveUser = Boolean(
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
        label: t('Add users'),
        isDisabled: canAssociateUser
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
        isDisabled: canRemoveUser
          ? undefined
          : t(
              'You do not have permission to remove users from this organization. Please contact your system administrator if there is an issue with your access.'
            ),
        onClick: removeUsers,
        isDanger: true,
      },
    ],
    [t, canAssociateUser, canRemoveUser, removeUsers, pageNavigate, params.id]
  );

  return toolbarActions;
}

export function useOrganizationUsersRowActions(view: IPlatformView<PlatformUser>) {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const pageNavigate = usePageNavigate();
  const { data: organization } = useGetItem<PlatformOrganization>(
    gatewayV1API`/organizations`,
    params.id
  );
  const { resource: awxOrganization, error: errorRetrievingAwxOrg } = useAwxResource<Organization>(
    '/organizations/',
    organization
  );
  const { resource: edaOrganization, error: errorRetrievingEdaOrg } =
    useEdaResource<EdaOrganization>('organizations/', organization);

  const removeUsers = useRemoveOrganizationUsers(view.unselectItemsAndRefresh);
  const { data: disassociateOptions } = useOptions<OptionsResponse<ActionsResponse>>(
    gatewayV1API`/organizations/${organization?.id?.toString() ?? ''}/users/disassociate/`
  );
  const canRemoveUser = Boolean(
    disassociateOptions?.actions && disassociateOptions.actions['POST']
  );
  const manageOrgRoles = useManageOrgRoles();
  const awxService = useHasAwxService();
  const edaService = useHasEdaService();
  const manageRolesHandleClick = useCallback(
    async (user: PlatformUser) => {
      const awxUser = await getAwxResource<AwxUser>('/users/', user);
      const edaUser = await getEdaResource<EdaUser>('users/', user);
      const orgListOptions = [
        ...(awxService && !errorRetrievingAwxOrg && awxOrganization?.id && (awxUser as AwxUser)?.id
          ? [
              {
                title: t('Automation Execution roles'),
                isExpandable: true,
                apiPrefixFunction: awxAPI,
                orgId: awxOrganization?.id?.toString() ?? '',
                userId: (awxUser as AwxUser)?.id?.toString(),
              },
            ]
          : []),
        ...(edaService && !errorRetrievingEdaOrg && edaOrganization?.id && (edaUser as EdaUser)?.id
          ? [
              {
                title: t('Automation Decisions roles'),
                isExpandable: true,
                apiPrefixFunction: edaAPI,
                orgId: edaOrganization?.id?.toString() ?? '',
                userId: (edaUser as EdaUser)?.id?.toString() ?? '',
              },
            ]
          : []),
      ];
      manageOrgRoles({
        orgListsOptions: orgListOptions,
        onManageRolesClick: () =>
          pageNavigate(PlatformRoute.OrganizationManageUserRoles, {
            params: { id: params.id, userId: user.id },
          }),
        userOrTeamName: user.username,
      });
    },
    [
      awxOrganization?.id,
      awxService,
      edaOrganization?.id,
      edaService,
      errorRetrievingAwxOrg,
      errorRetrievingEdaOrg,
      manageOrgRoles,
      pageNavigate,
      params.id,
      t,
    ]
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
        onClick: manageRolesHandleClick,
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Remove user'),
        isDisabled: canRemoveUser
          ? ''
          : t(`The user cannot be removed due to insufficient permissions.`),
        onClick: (user) => removeUsers([user]),
        isDanger: true,
      },
    ];
  }, [canRemoveUser, manageRolesHandleClick, removeUsers, t]);

  return rowActions;
}
