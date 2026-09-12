import { useAbortController } from '@ansible/ansible-ui-framework/hooks/useAbortController';
import { requestGet } from '@ansible/common-ui/crud/Data';
import { RequestError } from '@ansible/common-ui/crud/RequestError';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { useCallback } from 'react';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { awxAPI } from '../../../common/api/awx-utils';
import { getAddedAndRemoved } from '../../../common/util/getAddedAndRemoved';
import { Label } from '../../../interfaces/Label';
import { LaunchConfiguration } from '../../../interfaces/LaunchConfiguration';
import { Organization } from '../../../interfaces/Organization';
import { PromptFormValues } from '../../../resources/templates/WorkflowVisualizer/types';

async function getDefaultOrganization(): Promise<number> {
  const itemsResponse = await requestGet<AwxItemsResponse<Organization>>(awxAPI`/organizations/`);
  return itemsResponse.results[0].id || 1;
}

async function getScheduleLabels(scheduleId: number): Promise<Label[]> {
  const labels: Label[] = [];
  let url: string | undefined = awxAPI`/schedules/${scheduleId}/labels/?page_size=200`;
  while (url) {
    const response: AwxItemsResponse<Label> = await requestGet<AwxItemsResponse<Label>>(url);
    labels.push(...response.results);
    url = response.next ?? undefined;
  }
  return labels;
}

type PostDisassociate = (
  url: string,
  body: { id: number; disassociate: boolean },
  signal?: AbortSignal
) => Promise<unknown>;
type PostAssociate = (
  url: string,
  body: { name: string; organization: number },
  signal?: AbortSignal
) => Promise<unknown>;

function resolveSelectedLabels(
  labels: Label[],
  existingLabels: Label[],
  allLabels: Label[],
  defaultOrganization: number
): Label[] {
  return labels.map((label) => {
    if (label.id) return label;
    return (
      existingLabels.find((existingLabel) => existingLabel.name === label.name) ??
      allLabels.find(
        (availableLabel) =>
          availableLabel.name === label.name && availableLabel.organization === defaultOrganization
      ) ??
      label
    );
  });
}

async function disassociateLabels(
  labels: Label[],
  scheduleId: number,
  postDisassociate: PostDisassociate,
  signal: AbortSignal
): Promise<void> {
  for (const label of labels) {
    try {
      await postDisassociate(
        awxAPI`/schedules/${scheduleId.toString()}/labels/`,
        { id: label.id, disassociate: true },
        signal
      );
    } catch (error) {
      if (
        !(error instanceof RequestError) ||
        !error.details?.includes('Label matching query does not exist')
      ) {
        throw error;
      }
    }
  }
}

async function associateLabels(
  labels: Label[],
  scheduleId: number,
  defaultOrganization: number,
  postAssociateLabel: PostAssociate,
  signal: AbortSignal
): Promise<void> {
  for (const label of labels) {
    const labelOrganization =
      'organization' in label && typeof label.organization === 'number'
        ? label.organization
        : defaultOrganization;
    await postAssociateLabel(
      awxAPI`/schedules/${scheduleId.toString()}/labels/`,
      { name: label.name, organization: labelOrganization },
      signal
    );
  }
}

export const useProcessLabels = () => {
  const abortController = useAbortController();
  const postDisassociate = usePostRequest<{ id: number; disassociate: boolean }>();
  const postAssociateLabel = usePostRequest<{ name: string; organization: number }>();

  return useCallback(
    async (
      scheduleId: number,
      labels: PromptFormValues['labels'],
      launch_config: LaunchConfiguration | null,
      organization?: number | null,
      phase: 'associate' | 'disassociate' = 'associate'
    ) => {
      const existingLabels =
        !launch_config?.ask_labels_on_launch && scheduleId
          ? await getScheduleLabels(scheduleId)
          : (launch_config?.defaults?.labels ?? []);
      const selectedLabelsWithoutIds = (labels ?? []).filter((label) => !label.id);
      const defaultOrganization =
        organization ?? (selectedLabelsWithoutIds.length ? await getDefaultOrganization() : 1);
      const allLabels = selectedLabelsWithoutIds.length
        ? (await requestGet<AwxItemsResponse<Label>>(awxAPI`/labels/?page_size=200`)).results
        : [];
      const selectedLabels = resolveSelectedLabels(
        labels ?? [],
        existingLabels,
        allLabels,
        defaultOrganization
      );
      const { added, removed } = getAddedAndRemoved(existingLabels, selectedLabels);

      const labelsToDisassociate = (
        phase === 'disassociate' && !launch_config?.ask_labels_on_launch ? existingLabels : removed
      ).filter(
        (label, index, labelsToRemove) =>
          labelsToRemove.findIndex((candidate) => candidate.id === label.id) === index
      );
      // The schedule labels endpoint accepts one label per request. Keep removals sequential: AWX
      // rejects schedule updates while stale non-prompted labels remain associated.
      await disassociateLabels(
        labelsToDisassociate,
        scheduleId,
        postDisassociate,
        abortController.signal
      );

      if (phase === 'disassociate') {
        return;
      }

      // Keep associations sequential as well; concurrent requests can race AWX's label limit check.
      await associateLabels(
        added,
        scheduleId,
        defaultOrganization,
        postAssociateLabel,
        abortController.signal
      );
    },
    [postDisassociate, postAssociateLabel, abortController]
  );
};
