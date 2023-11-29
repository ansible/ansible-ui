import { useMemo } from 'react';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  useGetPageUrl,
  usePageAlertToaster,
  usePageNavigate,
} from '../../../../framework';
import { Authenticator } from '../../../interfaces/Authenticator';
import { AlertProps, ButtonVariant } from '@patternfly/react-core';
import { PencilAltIcon, PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { PlatformRoute } from '../../../PlatformRoutes';
import { IPlatformView } from '../../../hooks/usePlatformView';
import { useOptions } from '../../../../frontend/common/crud/useOptions';
import {
  ActionsResponse,
  OptionsResponse,
} from '../../../../frontend/awx/interfaces/OptionsResponse';
import { gatewayAPI } from '../../../api/gateway-api-utils';

export function useAuthenticatorToolbarActions(view: IPlatformView<Authenticator>) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();

  const { data } = useOptions<OptionsResponse<ActionsResponse>>(gatewayAPI`/v1/authenticators`);
  const canCreateAuthenticator = Boolean(data && data.actions && data.actions['POST']);
  const alert: AlertProps = {
    variant: 'warning',
    title: t(`Delete not implemented`),
    timeout: 2000,
  };
  const alertToaster = usePageAlertToaster();

  const toolbarActions = useMemo<IPageAction<Authenticator>[]>(
    () => [
      {
        type: PageActionType.Link,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Create authenticator'),
        isDisabled: canCreateAuthenticator
          ? undefined
          : t(
              'You do not have permission to create a authenticator. Please contact your system administrator if there is an issue with your access.'
            ),
        href: getPageUrl(PlatformRoute.CreateAuthenticator),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected authenticators'),
        onClick: () => alertToaster.addAlert(alert),
        isDanger: true,
      },
    ],
    [t, canCreateAuthenticator, getPageUrl]
  );

  return toolbarActions;
}

export function useAuthenticatorRowActions(_view: IPlatformView<Authenticator>) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const alert: AlertProps = {
    variant: 'warning',
    title: t(`Delete not implemented`),
    timeout: 2000,
  };
  const alertToaster = usePageAlertToaster();
  const rowActions = useMemo<IPageAction<Authenticator>[]>(() => {
    // TODO: Update based on RBAC information from Authenticators API
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const cannotDeleteAuthenticator = (authenticator: Authenticator) =>
      // eslint-disable-next-line no-constant-condition
      true ? '' : t(`The authenticator cannot be deleted due to insufficient permissions.`);
    // TODO: Update based on RBAC information from Authenticators API
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const cannotEditAuthenticator = (authenticator: Authenticator) =>
      // eslint-disable-next-line no-constant-condition
      true ? '' : t(`The authenticator cannot be edited due to insufficient permissions.`);

    return [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        // variant: ButtonVariant.primary,
        isPinned: true,
        icon: PencilAltIcon,
        label: t('Edit authenticator'),
        isDisabled: (authenticator: Authenticator) => cannotEditAuthenticator(authenticator),
        onClick: (authenticator) =>
          pageNavigate(PlatformRoute.EditAuthenticator, { params: { id: authenticator.id } }),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete authenticator'),
        isDisabled: (authenticator: Authenticator) => cannotDeleteAuthenticator(authenticator),
        onClick: () => alertToaster.addAlert(alert),
        isDanger: true,
      },
    ];
  }, [pageNavigate, t]);

  return rowActions;
}
