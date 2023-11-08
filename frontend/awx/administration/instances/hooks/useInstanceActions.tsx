import { useEffect, useState } from 'react';
import { Instance } from '../../../interfaces/Instance';
import { InstanceGroup } from '../../../interfaces/InstanceGroup';
import { requestGet, requestPatch } from '../../../../common/crud/Data';
import { debounce } from 'debounce';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';

export function useInstanceActions(instanceId: string) {
  const [instance, setInstance] = useState<Instance>();
  const [instanceGroups, setInstanceGroups] = useState<AwxItemsResponse<InstanceGroup>>();
  const [instanceForks, setInstanceForks] = useState(0);
  function computeForks(
    memCapacity: number,
    cpuCapacity: number,
    selectedCapacityAdjustment: number
  ) {
    const minCapacity = memCapacity;
    const maxCapacity = cpuCapacity;
    const percentage = selectedCapacityAdjustment * 100;

    return Math.round((maxCapacity - minCapacity) / 100) * percentage + minCapacity;
  }

  useEffect(() => {
    const fetchInstanceDetails = async () => {
      const instance = await requestGet<Instance>(`/api/v2/instances/${instanceId}/`);
      const instanceGroups = await requestGet<AwxItemsResponse<InstanceGroup>>(
        `/api/v2/instances/${instanceId}/instance_groups/`
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
    const response = await requestPatch<Instance>(`/api/v2/instances/${instance.id}/`, {
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
  const handleInstanceForksSlider = debounce(async (instance: Instance, value: number) => {
    const computedVal =
      mapBetween(value, 0, 100, instance.mem_capacity, instance.cpu_capacity) / 100;
    const response = await requestPatch<Instance>(`/api/v2/instances/${instance.id}/`, {
      capacity_adjustment: computedVal.toFixed(1),
    });
    setInstance(response);
    setInstanceForks(
      computeForks(
        response.mem_capacity,
        response.cpu_capacity,
        parseFloat(response.capacity_adjustment)
      )
    );
  });

  return {
    instance,
    instanceGroups,
    instanceForks,
    handleToggleInstance,
    handleInstanceForksSlider,
  };
}
