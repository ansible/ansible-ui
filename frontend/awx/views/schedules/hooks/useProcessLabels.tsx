import { useCallback } from 'react';
import { useAbortController } from '../../../../common/crud/useAbortController';
import { usePostRequest } from '../../../../common/crud/usePostRequest';
import { getAddedAndRemoved } from '../../../common/util/getAddedAndRemoved';
import { awxAPI } from '../../../common/api/awx-utils';
import { PromptFormValues } from '../../../resources/templates/WorkflowVisualizer/types';
import { Label } from 'dagre';
import { requestGet } from '../../../../common/crud/Data';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { Organization } from '../../../interfaces/Organization';
import { LaunchConfiguration } from '../../../interfaces/LaunchConfiguration';

async function getDefaultOrganization(): Promise<number> {
  const itemsResponse = await requestGet<AwxItemsResponse<Organization>>(awxAPI`/organizations/`);
  return itemsResponse.results[0].id || 1;
}
export const useProcessLabels = () => {
  const abortController = useAbortController();
  const postDisassociate = usePostRequest<{ id: number; disassociate: boolean }>();
  const postAssociateLabel = usePostRequest<
    { name: string; organization: number } | { id: number }
  >();

  return useCallback(
    async (
      scheduleId: number,
      labels: PromptFormValues['labels'],
      launch_config: LaunchConfiguration | null,
      organization?: number | null
    ) => {
      const hasLabelsPrompt = launch_config?.ask_labels_on_launch;
      const existingLabels = launch_config?.defaults?.labels;

      if (hasLabelsPrompt) {
        const defaultOrganization = organization ?? (await getDefaultOrganization());

        const { added, removed } = getAddedAndRemoved(
          existingLabels || [],
          labels || ([] as Label[])
        );

        const disassociationPromises = removed.map((label: { id: number }) =>
          postDisassociate(
            awxAPI`/schedules/${scheduleId.toString()}/labels/`,
            {
              id: label.id,
              disassociate: true,
            },
            abortController.signal
          )
        );

        const associationPromises = added.map(
          (label: { name: string; id?: number; organization?: number }) =>
            postAssociateLabel(
              awxAPI`/schedules/${scheduleId.toString()}/labels/`,
              label.id
                ? { id: label.id }
                : {
                    name: label.name,
                    organization: label?.organization ?? defaultOrganization,
                  },
              abortController.signal
            )
        );

        await Promise.all([...disassociationPromises, ...associationPromises]);
      } else if (existingLabels) {
        const disassociationPromises = existingLabels.map((label: { id: number }) =>
          postDisassociate(
            awxAPI`/schedules/${scheduleId.toString()}/labels/`,
            {
              id: label.id,
              disassociate: true,
            },
            abortController.signal
          )
        );
        await Promise.all(disassociationPromises);
      }
    },
    [postDisassociate, postAssociateLabel, abortController]
  );
};
