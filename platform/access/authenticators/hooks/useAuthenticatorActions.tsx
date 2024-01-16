import { AlertProps, ButtonVariant } from '@patternfly/react-core';
import { PencilAltIcon, PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  useGetPageUrl,
  usePageAlertToaster,
  usePageNavigate,
} from '../../../../framework';
import {
  ActionsResponse,
  OptionsResponse,
} from '../../../../frontend/awx/interfaces/OptionsResponse';
import { requestPatch } from '../../../../frontend/common/crud/Data';
import { useOptions } from '../../../../frontend/common/crud/useOptions';
import { gatewayV1API } from '../../../api/gateway-api-utils';
import { IPlatformView } from '../../../hooks/usePlatformView';
import { Authenticator } from '../../../interfaces/Authenticator';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { useDeleteAuthenticators } from './useDeleteAuthenticators';
import { useManageAuthenticators } from './useManageAuthenticators';

export function useAuthenticatorToolbarActions(view: IPlatformView<Authenticator>) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const deleteAuthenticators = useDeleteAuthenticators(view.unselectItemsAndRefresh);
  const manageAuthenticators = useManageAuthenticators(view.unselectItemsAndRefresh);

  const { data } = useOptions<OptionsResponse<ActionsResponse>>(gatewayV1API`/authenticators/`);
  const canCreateAuthenticator = Boolean(data && data.actions && data.actions['POST']);
  const toolbarActions = useMemo<IPageAction<Authenticator>[]>(
    () => [
      {
        type: PageActionType.Link,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Create authentication'),
        isDisabled: canCreateAuthenticator
          ? undefined
          : t(
              'You do not have permission to create an authentication. Please contact your system administrator if there is an issue with your access.'
            ),
        href: getPageUrl(PlatformRoute.CreateAuthenticator),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: false,
        icon: PlusCircleIcon,
        label: t('Manage authenticators'),
        isDisabled: canCreateAuthenticator
          ? undefined
          : t(
              'You do not have permission to manage authentications. Please contact your system administrator if there is an issue with your access.'
            ),
        onClick: manageAuthenticators.openReorderModal,
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected authentications'),
        onClick: deleteAuthenticators,
        isDanger: true,
      },
    ],
    [t, canCreateAuthenticator, deleteAuthenticators, manageAuthenticators, getPageUrl]
  );

  return toolbarActions;
}

export function useAuthenticatorRowActions(view: IPlatformView<Authenticator>) {
  const { t } = useTranslation();
  const deleteAuthenticator = useDeleteAuthenticators(view.unselectItemsAndRefresh);
  const pageNavigate = usePageNavigate();
  const alertToaster = usePageAlertToaster();
  const handleToggleAuthenticator: (
    authenticator: Authenticator,
    enabled: boolean
  ) => Promise<void> = useCallback(
    async (authenticator, enabled) => {
      const alert: AlertProps = {
        variant: 'success',
        title: `${authenticator.name} ${enabled ? t('enabled') : t('disabled')}.`,
        timeout: 5000,
      };
      await requestPatch(gatewayV1API`/authenticators/${authenticator.id.toString()}/`, {
        enabled: enabled,
      })
        .then(() => alertToaster.addAlert(alert))
        .catch(() => {
          alertToaster.addAlert({
            variant: 'danger',
            title: `${enabled ? t('Failed to enable') : t('Failed to disable')} ${
              authenticator.name
            }`,
            timeout: 5000,
          });
        });
      view.unselectItemsAndRefresh([authenticator]);
    },
    [view, alertToaster, t]
  );
  const rowActions = useMemo<IPageAction<Authenticator>[]>(() => {
    // TODO: Update based on RBAC information from Authenticators API
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const cannotDeleteAuthenticator = (authenticator: Authenticator) =>
      // eslint-disable-next-line no-constant-condition
      true ? '' : t(`The authentication cannot be deleted due to insufficient permissions.`);
    // TODO: Update based on RBAC information from Authenticators API
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const cannotEditAuthenticator = (authenticator: Authenticator) =>
      // eslint-disable-next-line no-constant-condition
      true ? '' : t(`The authentication cannot be edited due to insufficient permissions.`);

    return [
      {
        type: PageActionType.Switch,
        ariaLabel: (isEnabled) =>
          isEnabled ? t('Click to disable authentication') : t('Click to enable authentication'),
        selection: PageActionSelection.Single,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Enabled'),
        labelOff: t('Disabled'),
        showPinnedLabel: true,
        isReversed: false,
        onToggle: (authenticator, enabled) => handleToggleAuthenticator(authenticator, enabled),
        isSwitchOn: (authenticator: Authenticator) => authenticator?.enabled ?? false,
      },
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
        label: t('Delete authentication'),
        isDisabled: (authenticator: Authenticator) => cannotDeleteAuthenticator(authenticator),
        onClick: (authenticator) => deleteAuthenticator([authenticator]),
        isDanger: true,
      },
    ];
  }, [pageNavigate, deleteAuthenticator, handleToggleAuthenticator, t]);

  return rowActions;
}
