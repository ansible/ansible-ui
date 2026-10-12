import { IPageAction, PageActionSelection, PageActionType } from '@ansible/ansible-ui-framework';
import { ActionsResponse, OptionsResponse } from '@ansible/awx-ui/interfaces/OptionsResponse';
import { useGetItem } from '@ansible/common-ui/crud/useGet';
import { useOptions } from '@ansible/common-ui/crud/useOptions';
import { ButtonVariant } from '@patternfly/react-core';
import { MinusCircleIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { IPlatformView } from '../../../hooks/usePlatformView';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { useAssociateOrganizationAdmins } from './useAssociateOrganizationAdmins';
import { useRemoveOrganizationAdmins } from './useRemoveOrganizationAdmins';

export function useOrganizationAdminsToolbarActions(view: IPlatformView<PlatformUser>) {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: organization } = useGetItem<PlatformOrganization>(
    gatewayAPI`/organizations`,
    params.id
  );

  const { data: organizationOptions } = useOptions<OptionsResponse<ActionsResponse>>(
    gatewayAPI`/organizations/${organization?.id?.toString() ?? ''}/`
  );
  const canEditOrganization = Boolean(
    organizationOptions &&
      organizationOptions.actions &&
      (organizationOptions.actions['PUT'] || organizationOptions.actions['PATCH'])
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
        isDisabled: canEditOrganization
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
        icon: MinusCircleIcon,
        label: t('Remove administrators'),
        isDisabled: canEditOrganization
          ? undefined
          : t(
              'You do not have permission to remove administrators from this organization. Please contact your system administrator if there is an issue with your access.'
            ),
        onClick: removeAdmins,
        isDanger: true,
      },
    ],
    [t, canEditOrganization, associateAdmins, removeAdmins]
  );

  return toolbarActions;
}

export function useOrganizationAdminsRowActions(view: IPlatformView<PlatformUser>) {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: organization } = useGetItem<PlatformOrganization>(
    gatewayAPI`/organizations`,
    params.id
  );
  const removeAdmins = useRemoveOrganizationAdmins(view.unselectItemsAndRefresh);
  const { data: organizationOptions } = useOptions<OptionsResponse<ActionsResponse>>(
    gatewayAPI`/organizations/${organization?.id?.toString() ?? ''}/`
  );
  const canEditOrganization = Boolean(
    organizationOptions &&
      organizationOptions.actions &&
      (organizationOptions.actions['PUT'] || organizationOptions.actions['PATCH'])
  );

  const rowActions = useMemo<IPageAction<PlatformUser>[]>(() => {
    return [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: MinusCircleIcon,
        isPinned: true,
        label: t('Remove administrator'),
        isDisabled: canEditOrganization
          ? ''
          : t(`The administrator cannot be removed due to insufficient permissions.`),
        onClick: (admin) => removeAdmins([admin]),
        isDanger: true,
      },
    ];
  }, [canEditOrganization, removeAdmins, t]);

  return rowActions;
}
