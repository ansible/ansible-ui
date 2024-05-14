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
import { IPageAction, PageActionSelection, PageActionType } from '../../../../framework';
import { ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useGetItem } from '../../../../frontend/common/crud/useGet';
import { useParams } from 'react-router-dom';
import { useRemoveOrganizationAdmins } from './useRemoveOrganizationAdmins';
import { useAssociateOrganizationAdmins } from './useAssociateOrganizationAdmins';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';

export function useOrganizationAdminsToolbarActions(view: IPlatformView<PlatformUser>) {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: organization } = useGetItem<PlatformOrganization>(
    gatewayV1API`/organizations`,
    params.id
  );
  const { data: associateOptions } = useOptions<OptionsResponse<ActionsResponse>>(
    gatewayV1API`/organizations/${organization?.id?.toString() ?? ''}/admins/associate/`
  );
  const { data: disassociateOptions } = useOptions<OptionsResponse<ActionsResponse>>(
    gatewayV1API`/organizations/${organization?.id?.toString() ?? ''}/admins/disassociate/`
  );

  const canAssociateAdmin = useMemo(
    () => Boolean(associateOptions?.actions && associateOptions.actions['POST']),
    [associateOptions?.actions]
  );

  const canRemoveAdmin = Boolean(
    disassociateOptions?.actions && disassociateOptions.actions['POST']
  );
  const associateAdmins = useAssociateOrganizationAdmins(view.refresh);
  const removeAdmins = useRemoveOrganizationAdmins(view.unselectItemsAndRefresh);

  const toolbarActions = useMemo<IPageAction<PlatformUser>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Add administrators'),
        isDisabled: canAssociateAdmin
          ? undefined
          : t(
              'You do not have permission to add administrators to this organization. Please contact your system administrator if there is an issue with your access.'
            ),
        onClick: associateAdmins,
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Remove selected administrators'),
        isDisabled: canRemoveAdmin
          ? undefined
          : t(
              'You do not have permission to remove administrators from this organization. Please contact your system administrator if there is an issue with your access.'
            ),
        onClick: removeAdmins,
        isDanger: true,
      },
    ],
    [t, canAssociateAdmin, associateAdmins, canRemoveAdmin, removeAdmins]
  );

  return toolbarActions;
}

export function useOrganizationAdminsRowActions(view: IPlatformView<PlatformUser>) {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: organization } = useGetItem<PlatformOrganization>(
    gatewayV1API`/organizations`,
    params.id
  );
  const removeAdmins = useRemoveOrganizationAdmins(view.unselectItemsAndRefresh);
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
        icon: TrashIcon,
        label: t('Remove administrator'),
        isDisabled: canRemoveAdmin
          ? ''
          : t(`The administrator cannot be removed due to insufficient permissions.`),
        onClick: (admin) => removeAdmins([admin]),
        isDanger: true,
      },
    ];
  }, [canRemoveAdmin, removeAdmins, t]);

  return rowActions;
}