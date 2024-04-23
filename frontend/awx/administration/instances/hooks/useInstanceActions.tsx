import { MinusCircleIcon } from '@patternfly/react-icons';
import pDebounce from 'p-debounce';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '../../../../../framework';
import { requestGet, requestPatch } from '../../../../common/crud/Data';
import { useGet, useGetItem } from '../../../../common/crud/useGet';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxActiveUser } from '../../../common/useAwxActiveUser';
import { Instance } from '../../../interfaces/Instance';
import { InstanceGroup } from '../../../interfaces/InstanceGroup';
import { Settings } from '../../../interfaces/Settings';
import { useRemoveInstances } from './useRemoveInstances';
import {
  useEditInstanceRowAction,
  useRunHealthCheckRowAction,
  useToggleInstanceRowAction,
} from './useInstanceRowActions';
import { AwxRoute } from '../../../main/AwxRoutes';
import { TFunction } from 'i18next';
import { AwxUser } from '../../../interfaces/User';

export function useInstanceActions(instanceId: string) {
  const [instance, setInstance] = useState<Instance>();
  const [instanceGroups, setInstanceGroups] = useState<AwxItemsResponse<InstanceGroup>>();
  const [instanceForks, setInstanceForks] = useState(0);

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

export function useInstanceDetailsActions() {
  const params = useParams<{ id: string }>();
  const { data: instance, refresh } = useGetItem<Instance>(awxAPI`/instances`, params.id);
  const { data } = useGet<Settings>(awxAPI`/settings/system/`);

  const instancesType = instance?.node_type === 'execution' || instance?.node_type === 'hop';
  const isK8s = data?.IS_K8S;

  const toggleInstanceAction = useToggleInstanceRowAction(refresh);
  const editInstanceAction = useEditInstanceRowAction({
    isHidden: isK8s === false || !instancesType,
  });
  const runHealthCheckAction = useRunHealthCheckRowAction(refresh);
  const removeInstanceAction = useRemoveInstanceItemAction(instance);

  return useMemo<IPageAction<Instance>[]>(
    () => [toggleInstanceAction, editInstanceAction, removeInstanceAction, runHealthCheckAction],
    [toggleInstanceAction, editInstanceAction, removeInstanceAction, runHealthCheckAction]
  );
}

export function useRemoveInstanceItemAction(instance: Instance | undefined) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const removeInstances = useRemoveInstances((_instances: Instance[]) =>
    pageNavigate(AwxRoute.Instances)
  );
  const { data } = useGet<Settings>(awxAPI`/settings/system/`);

  const instancesType = instance?.node_type === 'execution' || instance?.node_type === 'hop';
  const isK8s = data?.IS_K8S;
  const { activeAwxUser } = useAwxActiveUser();

  return useMemo<IPageAction<Instance>>(
    () => ({
      type: PageActionType.Button,
      isHidden: () => isK8s === false || !instancesType,
      selection: PageActionSelection.Single,
      icon: MinusCircleIcon,
      label: t('Remove instance'),
      onClick: (instance: Instance) => removeInstances([instance]),
      isDisabled: (instance) => cannotRemoveInstances([instance], t, activeAwxUser, isK8s ?? false),
      isDanger: true,
    }),
    [t, removeInstances, instancesType, isK8s, activeAwxUser]
  );
}

export function cannotRemoveInstances(
  instances: Instance[],
  t: TFunction<'translation', undefined>,
  activeAwxUser: AwxUser | undefined,
  isK8s: boolean
) {
  const addEditPrivileges = activeAwxUser?.is_superuser || activeAwxUser?.is_system_auditor;
  if (instances.length === 0) {
    return t(`Select at least one item from the list.`);
  } else if (!isK8s) {
    return t('Cannot delete instances due to system environment');
  } else if (!addEditPrivileges) {
    return t('Cannot delete instances due to insufficient permissions');
  } else if (instances.find((instance: Instance) => !removeableInstance(instance))) {
    return t(
      'Cannot delete due to one or many instances being of type other than execution or hop.'
    );
  }
  return '';
}

export function computeForks(
  memCapacity: number,
  cpuCapacity: number,
  selectedCapacityAdjustment: number
) {
  const minCapacity = Math.min(memCapacity, cpuCapacity);
  const maxCapacity = Math.max(memCapacity, cpuCapacity);
  return Math.floor(minCapacity + (maxCapacity - minCapacity) * selectedCapacityAdjustment);
}

function removeableInstance(instance: Instance) {
  if (instance.node_type === 'execution' || instance.node_type === 'hop') {
    return true;
  }
  return false;
}
