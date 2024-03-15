import { ButtonVariant } from '@patternfly/react-core';
import { HeartbeatIcon, PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../../framework';
import { IAwxView } from '../../../common/useAwxView';
import { Instance } from '../../../interfaces/Instance';
import { useRunHealthCheck } from './useRunHealthCheck';
import { AwxRoute } from '../../../main/AwxRoutes';
import { usePageNavigate } from '../../../../../framework';
import { useAwxActiveUser } from '../../../common/useAwxActiveUser';
import { useGet } from '../../../../common/crud/useGet';
import { awxAPI } from '../../../common/api/awx-utils';
import { Settings } from '../../../interfaces/Settings';
import { useRemoveInstances } from './useRemoveInstances';
import { cannotRemoveInstances } from './useInstanceActions';

export function useInstanceToolbarActions(view: IAwxView<Instance>) {
  const { t } = useTranslation();
  const runHealthCheck = useRunHealthCheck(view.unselectItemsAndRefresh);
  const removeInstances = useRemoveInstances(view.unselectItemsAndRefresh);
  const pageNavigate = usePageNavigate();
  const activeUser = useAwxActiveUser();
  const { data } = useGet<Settings>(awxAPI`/settings/system/`);
  const isK8s = data?.IS_K8S;

  const canAddAndEditInstances =
    (activeUser?.is_superuser || activeUser?.is_system_auditor) && data?.IS_K8S;

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
      },
      {
        type: PageActionType.Button,
        isHidden: () => isK8s === false,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Remove instance'),
        onClick: (instance: Instance[]) => removeInstances(instance),
        isDisabled: (instances: Instance[]) => cannotRemoveInstances(instances, t),
        isDanger: true,
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        variant: ButtonVariant.primary,
        icon: HeartbeatIcon,
        label: t('Run health check'),
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
      canAddAndEditInstances,
      pageNavigate,
      isK8s,
      removeInstances,
      runHealthCheck,
      cannotRunHealthCheckDueToNodeType,
      cannotRunHealthCheckDueToPending,
    ]
  );
}
