import { requestGet } from '@ansible/common-ui/crud/Data';
import { useCallback } from 'react';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { awxAPI } from '../../../common/api/awx-utils';
import { useProcessCredentials } from './useProcessCredentials';
import { useProcessInstanceGroups } from './useProcessInstanceGroups';
import { useProcessLabels } from './useProcessLabels';
import { Label } from '../../../interfaces/Label';
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
        let launchConfig = payload.launch_config;
        if (launchConfig?.ask_labels_on_launch === false) {
          const scheduleLabels = await requestGet<AwxItemsResponse<Label>>(
            awxAPI`/schedules/${schedule.id}/labels/?page_size=200`
          );
          launchConfig = {
            ...launchConfig,
            defaults: { ...launchConfig.defaults, labels: scheduleLabels.results },
          };
        }
        await processLabels(schedule.id, payload.labels, launchConfig, payload.organization);
      }
    },
    [processCredentials, processInstanceGroups, processLabels]
  );
}
