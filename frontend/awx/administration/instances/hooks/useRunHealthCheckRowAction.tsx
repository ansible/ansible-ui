import { AlertProps, ButtonVariant } from '@patternfly/react-core';
import { HeartbeatIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageAlertToaster,
} from '../../../../../framework';
import { postRequest } from '../../../../common/crud/Data';
import { awxAPI } from '../../../common/api/awx-utils';
import { Instance } from '../../../interfaces/Instance';

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
