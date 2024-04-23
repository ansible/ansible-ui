import { ButtonVariant } from '@patternfly/react-core';
import { HeartbeatIcon, MinusCircleIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '../../../../../framework';
import { useGet } from '../../../../common/crud/useGet';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxActiveUser } from '../../../common/useAwxActiveUser';
import { IAwxView } from '../../../common/useAwxView';
import { Instance } from '../../../interfaces/Instance';
import { Settings } from '../../../interfaces/Settings';
import { AwxRoute } from '../../../main/AwxRoutes';
import { cannotRemoveInstances } from './useInstanceActions';
import { useRemoveInstances } from './useRemoveInstances';
import { useRunHealthCheck } from './useRunHealthCheck';

export function useInstanceToolbarActions(view: IAwxView<Instance>) {
  const { data } = useGet<Settings>(awxAPI`/settings/system/`);
  const isK8s = data?.IS_K8S;

  const healthCheckAction = useRunHealthCheckToolbarAction(view);
  const addInstanceAction = useAddInstanceToolbarAction();
  const removeInstanceAction = useRemoveInstanceToolbarAction(view);

  return useMemo<IPageAction<Instance>[]>(
    () =>
      isK8s
        ? [addInstanceAction, removeInstanceAction, healthCheckAction]
        : [addInstanceAction, healthCheckAction],
    [addInstanceAction, removeInstanceAction, healthCheckAction, isK8s]
  );
}

export function useRunHealthCheckToolbarAction(
  view: IAwxView<Instance>,
  isPinned?: boolean,
  isHidden?: boolean
) {
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

  return useMemo<IPageAction<Instance>>(
    () => ({
      type: PageActionType.Button,
      selection: PageActionSelection.Multiple,
      variant: ButtonVariant.primary,
      icon: HeartbeatIcon,
      label: t('Run health check'),
      isPinned: isPinned ?? false,
      isHidden: isHidden ?? false,
      onClick: (instances) => runHealthCheck(instances),
      isDisabled: (instances) =>
        instances.some(
          (instance) =>
            cannotRunHealthCheckDueToNodeType(instance) ||
            cannotRunHealthCheckDueToPending(instance)
        )
          ? 'Cannot run health checks on one or more of the selected instances'
          : '',
    }),
    [
      t,
      runHealthCheck,
      cannotRunHealthCheckDueToNodeType,
      cannotRunHealthCheckDueToPending,
      isPinned,
      isHidden,
    ]
  );
}

export function useRemoveInstanceToolbarAction(view: IAwxView<Instance>) {
  const removeInstances = useRemoveInstances(view.unselectItemsAndRefresh);
  const { t } = useTranslation();
  const { data } = useGet<Settings>(awxAPI`/settings/system/`);
  const isK8s = data?.IS_K8S;
  const { activeAwxUser } = useAwxActiveUser();

  return useMemo<IPageAction<Instance>>(
    () => ({
      type: PageActionType.Button,
      selection: PageActionSelection.Multiple,
      icon: MinusCircleIcon,
      label: t('Remove instance'),
      onClick: (instance: Instance[]) => removeInstances(instance),
      isDisabled: (instances: Instance[]) =>
        cannotRemoveInstances(instances, t, activeAwxUser, isK8s ?? false),
      isDanger: true,
    }),
    [t, removeInstances, isK8s, activeAwxUser]
  );
}

export function useAddInstanceToolbarAction() {
  const pageNavigate = usePageNavigate();
  const { activeAwxUser } = useAwxActiveUser();
  const { data } = useGet<Settings>(awxAPI`/settings/system/`);
  const isK8s = data?.IS_K8S;
  const { t } = useTranslation();

  const canAddAndEditInstances =
    (activeAwxUser?.is_superuser || activeAwxUser?.is_system_auditor) && data?.IS_K8S;
  return useMemo<IPageAction<Instance>>(
    () => ({
      type: PageActionType.Button,
      isHidden: () => isK8s === false,
      selection: PageActionSelection.None,
      variant: ButtonVariant.primary,
      isPinned: true,
      icon: PlusCircleIcon,
      label: t('Add instance'),
      onClick: () => pageNavigate(AwxRoute.AddInstance),
      isDisabled: canAddAndEditInstances
        ? undefined
        : t(
            'You do not have permission to add instances. Please contact your organization administrator if there is an issue with your access.'
          ),
    }),
    [t, canAddAndEditInstances, pageNavigate, isK8s]
  );
}
