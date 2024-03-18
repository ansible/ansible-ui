import { AlertProps, ButtonVariant } from '@patternfly/react-core';
import { HeartbeatIcon, PencilAltIcon } from '@patternfly/react-icons';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageAlertToaster,
  usePageNavigate,
} from '../../../../../framework';
import { postRequest, requestPatch } from '../../../../common/crud/Data';
import { awxAPI } from '../../../common/api/awx-utils';
import { Instance } from '../../../interfaces/Instance';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useAwxActiveUser } from '../../../common/useAwxActiveUser';
import { useGet } from '../../../../common/crud/useGet';
import { Settings } from '../../../interfaces/Settings';

export function useInstanceRowActions(onComplete: (instances: Instance[]) => void) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const activeUser = useAwxActiveUser();
  const { data } = useGet<Settings>(awxAPI`/settings/system/`);

  const alertToaster = usePageAlertToaster();
  const handleToggleInstance: (instance: Instance, enabled: boolean) => Promise<void> = useCallback(
    async (instance, enabled) => {
      await requestPatch(awxAPI`/instances/${instance.id.toString()}/`, { enabled });
      onComplete([instance]);
    },
    [onComplete]
  );
  const userAccess = activeUser?.is_superuser || activeUser?.is_system_auditor;
  const isK8s = data?.IS_K8S;

  return useMemo<IPageAction<Instance>[]>(
    () => [
      {
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
      },
      {
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
      },
      {
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
      },
    ],
    [t, handleToggleInstance, onComplete, alertToaster, pageNavigate, isK8s, userAccess]
  );
}
