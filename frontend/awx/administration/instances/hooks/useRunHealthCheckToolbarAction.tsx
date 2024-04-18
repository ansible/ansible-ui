import { ButtonVariant } from '@patternfly/react-core';
import { HeartbeatIcon } from '@patternfly/react-icons';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionType, PageActionSelection } from '../../../../../framework';
import { IAwxView } from '../../../common/useAwxView';
import { Instance } from '../../../interfaces/Instance';
import { useRunHealthCheck } from './useRunHealthCheck';

export function useRunHealthCheckToolbarAction(view: IAwxView<Instance>, isPinned?: boolean) {
  const { t } = useTranslation();
  const runHealthCheck = useRunHealthCheck(view.unselectItemsAndRefresh);

  const cannotRunHealthCheckDueToPending = useCallback(
    (instance: Instance) => {
      if (instance.health_check_pending)
        return t(
          `Instance has pending health checks. Wait for those to complete before attempting another health check.`
        );
      return '';
    },
    [t]
  );

  const cannotRunHealthCheckDueToNodeType = useCallback(
    (instance: Instance) => {
      if (instance.node_type !== 'execution')
        return t(`Health checks can only be run on execution instances.`);
      return '';
    },
    [t]
  );

  return useMemo<IPageAction<Instance>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        variant: ButtonVariant.primary,
        icon: HeartbeatIcon,
        label: t('Run health check'),
        isPinned: isPinned ?? false,
        onClick: (instances) => runHealthCheck(instances),
        isDisabled: (instances) =>
          instances.some(
            (instance) =>
              cannotRunHealthCheckDueToNodeType(instance) ||
              cannotRunHealthCheckDueToPending(instance)
          )
            ? 'Cannot run health checks on one or more of the selected instances'
            : '',
      },
    ],
    [
      t,
      runHealthCheck,
      cannotRunHealthCheckDueToNodeType,
      cannotRunHealthCheckDueToPending,
      isPinned,
    ]
  );
}
