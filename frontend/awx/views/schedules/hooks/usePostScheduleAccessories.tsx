import { useCallback } from 'react';
import { useProcessCredentials } from './useProcessCredentials';
import { useProcessInstanceGroups } from './useProcessInstanceGroups';
import { useProcessLabels } from './useProcessLabels';
import { Schedule } from '../../../interfaces/Schedule';
import { StandardizedFormData } from '../wizard/ScheduleAddWizard';

export function usePostAccessories() {
  const processCredentials = useProcessCredentials();
  const processInstanceGroups = useProcessInstanceGroups();
  const processLabels = useProcessLabels();
  return useCallback(
    async (
      schedule: Schedule,
      payload: Pick<StandardizedFormData, 'launch_config'> &
        Partial<
          Pick<
            StandardizedFormData['prompt'],
            'credentials' | 'instance_groups' | 'labels' | 'organization'
          >
        >
    ) => {
      if (payload?.credentials?.length) {
        await processCredentials(schedule.id, payload.credentials, payload.launch_config);
      }
      if (payload.instance_groups) {
        await processInstanceGroups(schedule.id, payload.instance_groups, payload.launch_config);
      }
      if (payload.labels) {
        await processLabels(
          schedule.id,
          payload.labels,
          payload.launch_config,
          payload.organization
        );
      }
    },
    [processCredentials, processInstanceGroups, processLabels]
  );
}
