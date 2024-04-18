import { useCallback, useMemo } from 'react';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageAlertToaster,
  usePageNavigate,
} from '../../../../../framework';
import { Instance } from '../../../interfaces/Instance';
import { ButtonVariant, AlertProps } from '@patternfly/react-core';
import { HeartbeatIcon, PencilAltIcon } from '@patternfly/react-icons';
import { Settings } from '../../../interfaces/Settings';
import { useTranslation } from 'react-i18next';
import { requestPatch, postRequest } from '../../../../common/crud/Data';
import { useGet } from '../../../../common/crud/useGet';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxActiveUser } from '../../../common/useAwxActiveUser';
import { AwxRoute } from '../../../main/AwxRoutes';

export function useInstanceRowActions(onComplete: (instances: Instance[]) => void) {
  const toggleInstanceRowAction: IPageAction<Instance> = useToggleInstanceRowAction(onComplete);
  const healthCheckRowAction: IPageAction<Instance> = useRunHealthCheckRowAction(onComplete);
  const editInstanceRowAction: IPageAction<Instance> = useEditInstanceRowAction();

  return useMemo<IPageAction<Instance>[]>(
    () => [toggleInstanceRowAction, healthCheckRowAction, editInstanceRowAction],
    [toggleInstanceRowAction, healthCheckRowAction, editInstanceRowAction]
  );
}

export function useToggleInstanceRowAction(onComplete: (instances: Instance[]) => void) {
  const { t } = useTranslation();
  const { activeAwxUser } = useAwxActiveUser();
  const { data } = useGet<Settings>(awxAPI`/settings/system/`);

  const handleToggleInstance: (instance: Instance, enabled: boolean) => Promise<void> = useCallback(
    async (instance, enabled) => {
      await requestPatch(awxAPI`/instances/${instance.id.toString()}/`, { enabled });
      onComplete([instance]);
    },
    [onComplete]
  );
  const userAccess = activeAwxUser?.is_superuser || activeAwxUser?.is_system_auditor;
  const isK8s = data?.IS_K8S;

  return useMemo<IPageAction<Instance>>(
    () => ({
      type: PageActionType.Switch,
      ariaLabel: (isEnabled) =>
        isEnabled ? t('Click to disable instance') : t('Click to enable instance'),
      selection: PageActionSelection.Single,
      isPinned: true,
      onToggle: (instance, enabled) => handleToggleInstance(instance, enabled),
      isSwitchOn: (instance) => instance.enabled,
      label: t('Enabled'),
      labelOff: t('Disabled'),
      showPinnedLabel: false,
      isHidden: (instance) => instance.node_type === 'hop',
      isDisabled: (instance) =>
        !userAccess ||
        !isK8s ||
        (instance?.node_type !== 'execution' && instance?.node_type !== 'hop')
          ? t(
              'You do not have permission to edit instances. Please contact your organization administrator if there is an issue with your access.'
            )
          : undefined,
    }),
    [t, handleToggleInstance, isK8s, userAccess]
  );
}

export function useRunHealthCheckRowAction(onComplete: (instances: Instance[]) => void) {
  const { t } = useTranslation();

  const alertToaster = usePageAlertToaster();

  return useMemo<IPageAction<Instance>>(
    () => ({
      type: PageActionType.Button,
      selection: PageActionSelection.Single,
      variant: ButtonVariant.secondary,
      isPinned: true,
      isDisabled: (instance) =>
        instance.node_type !== 'execution'
          ? t('Cannot run health check on a {{ type }} instance', { type: instance.node_type })
          : instance.health_check_pending
            ? t('Health check pending')
            : undefined,
      icon: HeartbeatIcon,
      label: t('Run health check'),
      onClick: (instance: Instance) => {
        const alert: AlertProps = {
          variant: 'success',
          title: t(`Running health check on ${instance.hostname}.`),
          timeout: 4000,
        };
        postRequest(awxAPI`/instances/${instance.id.toString()}/health_check/`, {})
          .then(() => {
            alertToaster.addAlert(alert);
            onComplete([instance]);
          })
          .catch((error) => {
            alertToaster.addAlert({
              variant: 'danger',
              title: t('Failed to perform health check'),
              children: error instanceof Error && error.message,
            });
          });
      },
    }),
    [t, onComplete, alertToaster]
  );
}

export function useEditInstanceRowAction() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const { activeAwxUser } = useAwxActiveUser();
  const { data } = useGet<Settings>(awxAPI`/settings/system/`);
  const userAccess = activeAwxUser?.is_superuser || activeAwxUser?.is_system_auditor;
  const isK8s = data?.IS_K8S;

  return useMemo<IPageAction<Instance>>(
    () => ({
      type: PageActionType.Button,
      selection: PageActionSelection.Single,
      icon: PencilAltIcon,
      isPinned: true,
      label: t('Edit instance'),
      onClick: (instance) => pageNavigate(AwxRoute.EditInstance, { params: { id: instance.id } }),
      isDisabled: (instance) =>
        !userAccess ||
        !isK8s ||
        (instance?.node_type !== 'execution' && instance?.node_type !== 'hop')
          ? t(
              'You do not have permission to edit instances. Please contact your organization administrator if there is an issue with your access.'
            )
          : undefined,
    }),
    [t, pageNavigate, isK8s, userAccess]
  );
}
