import { ButtonVariant } from '@patternfly/react-core';
import { HeartbeatIcon, MinusCircleIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
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
import {
  cannotRemoveInstances,
  cannotRunHealthCheckDueToManagedInstance,
  cannotRunHealthCheckDueToNodeType,
  cannotRunHealthCheckDueToPending,
  cannotRunHealthCheckDueToPermissions,
} from './useInstanceActions';
import { useRemoveInstances } from './useRemoveInstances';
import { useRunHealthCheck } from './useRunHealthCheck';

export function useInstanceToolbarActions(view: IAwxView<Instance>) {
  const { activeAwxUser } = useAwxActiveUser();
  const { data } = useGet<Settings>(awxAPI`/settings/system/`);
  const isK8s = data?.IS_K8S;

  const healthCheckAction = useRunHealthCheckToolbarAction(view);
  const addInstanceAction = useAddInstanceToolbarAction();
  const removeInstanceAction = useRemoveInstanceToolbarAction(view);

  return useMemo<IPageAction<Instance>[]>(
    () =>
      isK8s && (activeAwxUser?.is_superuser || activeAwxUser?.is_system_auditor)
        ? [addInstanceAction, removeInstanceAction, healthCheckAction]
        : [healthCheckAction],
    [
      addInstanceAction,
      removeInstanceAction,
      healthCheckAction,
      isK8s,
      activeAwxUser?.is_superuser,
      activeAwxUser?.is_system_auditor,
    ]
  );
}

export function useRunHealthCheckToolbarAction(
  view: IAwxView<Instance>,
  isPinned?: boolean,
  isHidden?: boolean
) {
  const { t } = useTranslation();
  const runHealthCheck = useRunHealthCheck(view.unselectItemsAndRefresh);
  const { activeAwxUser } = useAwxActiveUser();

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
            cannotRunHealthCheckDueToNodeType(instance, t) ||
            cannotRunHealthCheckDueToPermissions(activeAwxUser, t) ||
            cannotRunHealthCheckDueToManagedInstance(instance, t) ||
            cannotRunHealthCheckDueToPending(instance, t)
        )
          ? 'Cannot run health checks on one or more of the selected instances'
          : '',
    }),
    [t, runHealthCheck, isPinned, isHidden, activeAwxUser]
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
      label: t('Create instance'),
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
