import { useAbortController } from '@ansible/ansible-ui-framework/hooks/useAbortController';
import { requestGet } from '@ansible/common-ui/crud/Data';
import { RequestError } from '@ansible/common-ui/crud/RequestError';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { useCallback } from 'react';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { awxAPI } from '../../../common/api/awx-utils';
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

type ProcessLabel = { id: number; name: string; organization?: number };

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
  labels: ProcessLabel[],
  existingLabels: ProcessLabel[],
  defaultOrganization: number
): ProcessLabel[] {
  return labels.map((label) => {
    if (label.id) return label;
    return (
      existingLabels.find(
        (existingLabel) =>
          existingLabel.name === label.name &&
          (existingLabel.organization === undefined ||
            existingLabel.organization === (label.organization ?? defaultOrganization))
      ) ?? { ...label, organization: label.organization ?? defaultOrganization }
    );
  });
}

async function disassociateLabels(
  labels: ProcessLabel[],
  scheduleId: number,
  postDisassociate: PostDisassociate,
  signal: AbortSignal
): Promise<void> {
  const results = await Promise.allSettled(
    labels.map(async (label) => {
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
    })
  );
  const failed = results.find(
    (result): result is PromiseRejectedResult => result.status === 'rejected'
  );
  if (failed) throw failed.reason;
}

async function associateLabels(
  labels: ProcessLabel[],
  scheduleId: number,
  defaultOrganization: number,
  postAssociateLabel: PostAssociate,
  signal: AbortSignal
): Promise<void> {
  for (const label of labels) {
    await postAssociateLabel(
      awxAPI`/schedules/${scheduleId.toString()}/labels/`,
      { name: label.name, organization: label.organization ?? defaultOrganization },
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
      labels: PromptFormValues['labels'] | undefined,
      _launchConfig: LaunchConfiguration | null,
      organization?: number | null,
      phase: 'associate' | 'disassociate' = 'associate'
    ) => {
      if (labels === undefined) return;

      const existingLabels = await getScheduleLabels(scheduleId);
      const labelsWithoutIds = labels.filter((label) => !label.id);
      const defaultOrganization =
        organization ?? (labelsWithoutIds.length ? await getDefaultOrganization() : 1);
      const selectedLabels = resolveSelectedLabels(labels, existingLabels, defaultOrganization);
      const existingById = new Map(existingLabels.map((label) => [label.id, label]));
      const selectedIds = new Set(selectedLabels.flatMap((label) => (label.id ? [label.id] : [])));
      const removed =
        phase === 'disassociate'
          ? existingLabels
          : existingLabels.filter((label) => !selectedIds.has(label.id));
      const added =
        phase === 'disassociate'
          ? []
          : selectedLabels.filter((label) => !label.id || !existingById.has(label.id));
      const uniqueRemoved = removed.filter(
        (label, index, labelsToRemove) =>
          labelsToRemove.findIndex((candidate) => candidate.id === label.id) === index
      );

      // Detach before attaching to avoid transient label-limit failures.
      await disassociateLabels(uniqueRemoved, scheduleId, postDisassociate, abortController.signal);
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
