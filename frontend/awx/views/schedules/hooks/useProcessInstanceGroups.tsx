import { useAbortController } from '@ansible/ansible-ui-framework/hooks/useAbortController';
import { requestGet } from '@ansible/common-ui/crud/Data';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { useCallback } from 'react';
import { awxAPI } from '../../../common/api/awx-utils';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { getAddedAndRemoved } from '../../../common/util/getAddedAndRemoved';
import { InstanceGroup } from '../../../interfaces/InstanceGroup';
import { LaunchConfiguration } from '../../../interfaces/LaunchConfiguration';
import { PromptFormValues } from '../../../resources/templates/WorkflowVisualizer/types';

export const useProcessInstanceGroups = () => {
  const abortController = useAbortController();
  const postDisassociate = usePostRequest<{ id: number; disassociate: boolean }>();
  const postAssociateInstanceGroup = usePostRequest<{ id: number }, InstanceGroup>();

  return useCallback(
    async (
      scheduleId: number,
      instance_groups: PromptFormValues['instance_groups'],
      launch_config: LaunchConfiguration | null
    ) => {
      const hasInstanceGroupsPrompt = launch_config?.ask_instance_groups_on_launch;
      const existingScheduleInstanceGroups = await requestGet<AwxItemsResponse<InstanceGroup>>(
        awxAPI`/schedules/${scheduleId.toString()}/instance_groups/`
      );

      if (hasInstanceGroupsPrompt) {
        const { added, removed } = getAddedAndRemoved(
          existingScheduleInstanceGroups.results || [],
          instance_groups || ([] as InstanceGroup[])
        );

        const disassociationPromises = removed.map((group: { id: number }) =>
          postDisassociate(
            awxAPI`/schedules/${scheduleId.toString()}/instance_groups/`,
            {
              id: group.id,
              disassociate: true,
            },
            abortController.signal
          )
        );

        const associationPromises = added.map((group) =>
          postAssociateInstanceGroup(
            awxAPI`/schedules/${scheduleId.toString()}/instance_groups/`,
            {
              id: group.id,
            },
            abortController.signal
          )
        );

        await Promise.all([...disassociationPromises, ...associationPromises]);
      } else if (existingScheduleInstanceGroups.results?.length) {
        const disassociationPromises = existingScheduleInstanceGroups.results.map(
          (group: { id: number }) =>
            postDisassociate(
              awxAPI`/schedules/${scheduleId.toString()}/instance_groups/`,
              {
                id: group.id,
                disassociate: true,
              },
              abortController.signal
            )
        );
        await Promise.all(disassociationPromises);
      }
    },
    [postDisassociate, postAssociateInstanceGroup, abortController]
  );
};
