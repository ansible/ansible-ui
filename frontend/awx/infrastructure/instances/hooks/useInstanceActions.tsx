import pDebounce from 'p-debounce';
import { useEffect, useMemo, useState } from 'react';
import { postRequest, requestGet, requestPatch } from '../../../../common/crud/Data';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { awxAPI } from '../../../common/api/awx-utils';
import { Instance } from '../../../interfaces/Instance';
import { InstanceGroup } from '../../../interfaces/InstanceGroup';
import { HeartbeatIcon, PencilAltIcon, TrashIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import {
  usePageNavigate,
  IPageAction,
  PageActionType,
  PageActionSelection,
} from '../../../../../framework';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useRemoveInstances } from './useRemoveInstances';
import { ButtonVariant } from '@patternfly/react-core';
import { useGet, useGetItem } from '../../../../common/crud/useGet';
import { useAwxActiveUser } from '../../../common/useAwxActiveUser';
import { Settings } from '../../../interfaces/Settings';
import { useParams } from 'react-router-dom';
import { TFunction } from 'i18next';

export function useInstanceActions(instanceId: string) {
  const [instance, setInstance] = useState<Instance>();
  const [instanceGroups, setInstanceGroups] = useState<AwxItemsResponse<InstanceGroup>>();
  const [instanceForks, setInstanceForks] = useState(0);
  function computeForks(
    memCapacity: number,
    cpuCapacity: number,
    selectedCapacityAdjustment: number
  ) {
    const minCapacity = Math.min(memCapacity, cpuCapacity);
    const maxCapacity = Math.max(memCapacity, cpuCapacity);
    return Math.floor(minCapacity + (maxCapacity - minCapacity) * selectedCapacityAdjustment);
  }

  useEffect(() => {
    const fetchInstanceDetails = async () => {
      const instance = await requestGet<Instance>(awxAPI`/instances/${instanceId}/`);
      const instanceGroups = await requestGet<AwxItemsResponse<InstanceGroup>>(
        awxAPI`/instances/${instanceId}/instance_groups/`
      );
      setInstance(instance);
      setInstanceGroups(instanceGroups);
      setInstanceForks(
        computeForks(
          instance.mem_capacity,
          instance.cpu_capacity,
          parseFloat(instance.capacity_adjustment)
        )
      );
    };

    void fetchInstanceDetails();
  }, [instanceId]);

  const handleToggleInstance = async (instance: Instance, enabled: boolean) => {
    const response = await requestPatch<Instance>(awxAPI`/instances/${instance.id.toString()}/`, {
      enabled,
    });
    setInstance(response);
  };

  function mapBetween(
    currentVal: number,
    minAllowed: number,
    maxAllowed: number,
    min: number,
    max: number
  ) {
    return ((maxAllowed - minAllowed) * (currentVal - min)) / (max - min) + minAllowed;
  }
  const handleInstanceForksSlider = pDebounce(async (instance: Instance, value: number) => {
    const adjustedMin = Math.min(instance.mem_capacity, instance.cpu_capacity);
    const adjustedMax = Math.max(instance.mem_capacity, instance.cpu_capacity);
    const computedVal = mapBetween(value, 0, 1, adjustedMin, adjustedMax);
    const response = await requestPatch<Instance>(awxAPI`/instances/${instance.id.toString()}/`, {
      capacity_adjustment: computedVal.toFixed(2),
    });
    setInstance(response);
    setInstanceForks(
      computeForks(
        response.mem_capacity,
        response.cpu_capacity,
        parseFloat(response.capacity_adjustment)
      )
    );
  }, 200);

  return {
    instance,
    instanceGroups,
    instanceForks,
    handleToggleInstance,
    handleInstanceForksSlider,
  };
}

export function useInstanceDetailsActions(options: {
  onInstancesRemoved: (instance: Instance[]) => void;
  isDetailsPageAction?: boolean;
}) {
  const { onInstancesRemoved } = options;
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const pageNavigate = usePageNavigate();
  const { data: instance } = useGetItem<Instance>(awxAPI`/instances`, params.id);

  const removeInstances = useRemoveInstances(onInstancesRemoved);
  const activeUser = useAwxActiveUser();
  const { data } = useGet<Settings>(awxAPI`/settings/system/`);
  const instancesType = instance?.node_type === 'execution' || instance?.node_type === 'hop';
  const userAccess = activeUser?.is_superuser || activeUser?.is_system_auditor;
  const isK8s = data?.IS_K8S;
  const canEditAndRemoveInstances = instancesType && isK8s && userAccess;

  return useMemo<IPageAction<Instance>[]>(
    () => [
      {
        type: PageActionType.Button,
        isHidden: () => isK8s === false || !instancesType,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PencilAltIcon,
        label: t('Edit instance'),
        onClick: () => pageNavigate(AwxRoute.EditInstance, { params: { id: params.id } }),
        isDisabled: canEditAndRemoveInstances
          ? undefined
          : t(
              'You do not have permission to edit instances. Please contact your organization administrator if there is an issue with your access.'
            ),
      },
      {
        type: PageActionType.Button,
        isHidden: () => isK8s === false || !instancesType,
        selection: PageActionSelection.Single,
        isPinned: true,
        icon: TrashIcon,
        label: t('Remove instance'),
        onClick: (instance: Instance) => removeInstances([instance]),
        isDisabled: () =>
          canEditAndRemoveInstances
            ? undefined
            : t(
                'You do not have permission to remove instances. Please contact your organization administrator if there is an issue with your access.'
              ),
        isDanger: true,
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: HeartbeatIcon,
        variant: ButtonVariant.secondary,
        isPinned: true,
        label: t('Run health check'),
        onClick: (instance: Instance) => {
          void postRequest(awxAPI`/instances/${instance?.id.toString() ?? ''}/health_check/`, {});
        },
      },
    ],
    [t, canEditAndRemoveInstances, isK8s, instancesType, pageNavigate, params.id, removeInstances]
  );
}

export function cannotRemoveInstance(instance: Instance, t: (string: string) => string) {
  if (instance.node_type === 'execution' || instance.node_type === 'hop') {
    return '';
  }
  return t(`This cannot be deleted due to insufficient permissions.`);
}

export function cannotRemoveInstances(
  instances: Instance[],
  t: TFunction<'translation', undefined>
) {
  if (instances.length === 0) {
    return t(`Select at least one item from the list.`);
  } else if (instances.find((instance: Instance) => cannotRemoveInstance(instance, t))) {
    return t(`Cannot delete due to insufficient permissions with one or many items.`);
  }
  return '';
}
