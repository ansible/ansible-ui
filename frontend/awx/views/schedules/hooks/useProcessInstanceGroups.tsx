import { useCallback } from 'react';
import { useAbortController } from '../../../../common/crud/useAbortController';
import { usePostRequest } from '../../../../common/crud/usePostRequest';
import { getAddedAndRemoved } from '../../../common/util/getAddedAndRemoved';
import { awxAPI } from '../../../common/api/awx-utils';
import { PromptFormValues } from '../../../resources/templates/WorkflowVisualizer/types';
import { InstanceGroup } from '../../../interfaces/InstanceGroup';
import { LaunchConfiguration } from '../../../interfaces/LaunchConfiguration';

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
      const existingInstanceGroups = launch_config?.defaults.instance_groups;

      if (hasInstanceGroupsPrompt) {
        const { added, removed } = getAddedAndRemoved(
          existingInstanceGroups || [],
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
      } else if (existingInstanceGroups) {
        const disassociationPromises = existingInstanceGroups.map((group: { id: number }) =>
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
