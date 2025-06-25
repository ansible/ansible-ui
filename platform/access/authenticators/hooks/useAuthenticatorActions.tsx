import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  useGetPageUrl,
  usePageAlertToaster,
  usePageDialog,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { ActionsResponse, OptionsResponse } from '@ansible/awx-ui/interfaces/OptionsResponse';
import { requestPatch } from '@ansible/common-ui/crud/Data';
import { useOptions } from '@ansible/common-ui/crud/useOptions';
import { AlertProps, ButtonVariant } from '@patternfly/react-core';
import { CogIcon, PencilAltIcon, PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { IPlatformView } from '../../../hooks/usePlatformView';
import { Authenticator } from '../../../interfaces/Authenticator';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { useDeleteAuthenticators } from './useDeleteAuthenticators';
import { ReorderAuthenticatorsModal } from './useReorderAuthenticators';

export function useAuthenticatorToolbarActions(view: IPlatformView<Authenticator>) {
  const { t } = useTranslation();
  const [_, setDialog] = usePageDialog();
  const getPageUrl = useGetPageUrl();
  const deleteAuthenticators = useDeleteAuthenticators(view.unselectItemsAndRefresh);

  const { data } = useOptions<OptionsResponse<ActionsResponse>>(gatewayAPI`/authenticators/`);
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
        icon: CogIcon,
        label: t('Manage authentications'),
        isDisabled: canCreateAuthenticator
          ? undefined
          : t(
              'You do not have permission to manage authentications. Please contact your system administrator if there is an issue with your access.'
            ),
        onClick: () =>
          setDialog(<ReorderAuthenticatorsModal onComplete={view.unselectItemsAndRefresh} />),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete authentications'),
        onClick: deleteAuthenticators,
        isDanger: true,
      },
    ],
    [
      t,
      canCreateAuthenticator,
      getPageUrl,
      deleteAuthenticators,
      setDialog,
      view.unselectItemsAndRefresh,
    ]
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
      await requestPatch(gatewayAPI`/authenticators/${authenticator.id.toString()}/`, {
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
        label: t('Edit authentication'),
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

export function useAuthenticatorPageActions(
  onAuthenticatorsDeleted: (authenticators: Authenticator[]) => void,
  onToggle: (authenticator: Authenticator) => void
) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteAuthenticators = useDeleteAuthenticators(onAuthenticatorsDeleted);
  const params = useParams<{ id: string }>();
  const { data } = useOptions<OptionsResponse<ActionsResponse>>(
    gatewayAPI`/authenticators/${params.id ?? ''}/`
  );

  const canEditAuthenticator = Boolean(
    data && data.actions && (data.actions['PUT'] || data.actions['PATCH'])
  );

  const handleToggleAuthenticator: (
    authenticator: Authenticator,
    enabled: boolean
  ) => Promise<void> = useCallback(
    async (authenticator, enabled) => {
      const patchedAuthenticator = await requestPatch<Authenticator>(
        gatewayAPI`/authenticators/${authenticator.id.toString()}/`,
        {
          enabled,
        }
      );
      onToggle(patchedAuthenticator);
    },
    [onToggle]
  );

  const pageActions = useMemo<IPageAction<Authenticator>[]>(() => {
    const cannotDeleteAuthenticator = () =>
      canEditAuthenticator
        ? ''
        : t(`The authenticator cannot be deleted due to insufficient permissions.`);
    const cannotEditAuthenticator = () =>
      canEditAuthenticator
        ? ''
        : t(`The authenticator cannot be edited due to insufficient permissions.`);

    return [
      {
        type: PageActionType.Switch,
        ariaLabel: (isEnabled) =>
          isEnabled ? t('Click to disable authentication') : t('Click to enable authentication'),
        selection: PageActionSelection.Single,
        onToggle: (authenticator, enabled) => handleToggleAuthenticator(authenticator, enabled),
        isSwitchOn: (authenticator: Authenticator) => (authenticator.enabled ? true : false),
        label: t('Authentication enabled'),
        labelOff: t('Authentication disabled'),
        showPinnedLabel: false,
        isPinned: true,
        isDisabled: cannotEditAuthenticator,
        tooltip: t(
          'Indicates if an authentication is enabled and will be included in the hierarchy of authentication mechanisms.'
        ),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        isPinned: true,
        icon: PencilAltIcon,
        variant: ButtonVariant.primary,
        label: t('Edit authentication'),
        isDisabled: cannotEditAuthenticator,
        onClick: (authenticator) =>
          pageNavigate(PlatformRoute.EditAuthenticator, { params: { id: authenticator.id } }),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete authentication'),
        isDisabled: cannotDeleteAuthenticator,
        onClick: (authenticator) => deleteAuthenticators([authenticator]),
        isDanger: true,
      },
    ];
  }, [canEditAuthenticator, deleteAuthenticators, handleToggleAuthenticator, pageNavigate, t]);

  return pageActions;
}
