import { usePageAlertToaster } from '@ansible/ansible-ui-framework';
import { requestGet } from '@ansible/common-ui/crud/Data';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { useAwxGetAllPages } from '../../../common/useAwxGetAllPages';

import { awxAPI } from '../../../common/api/awx-utils';
import type { JobTemplate } from '../../../interfaces/JobTemplate';
import type { Label } from '../../../interfaces/Label';
import type { Organization } from '../../../interfaces/Organization';

type LabelPayload = (
  promptLabels: { name: string; id?: number }[],
  template: JobTemplate
) => Promise<number[]>;

export function useLabelPayload() {
  const { t } = useTranslation();
  const alertToaster = usePageAlertToaster();
  const postRequest = usePostRequest<{ name: string; organization: number }, Label>();
  const { results: allLabels = [] } = useAwxGetAllPages<Label>(awxAPI`/labels/`);

  return useCallback<LabelPayload>(
    async (promptLabels, template) => {
      const labelIds = new Set<number>();
      const existingLabelMap = new Map(allLabels?.map((label) => [label.name, label.id]));
      const templateLabels = template.summary_fields.labels.results;

      // By default, jobs inherit their template's labels
      templateLabels.forEach((label) => labelIds.add(label.id));

      let organizationId = template?.summary_fields?.organization?.id;
      if (!organizationId) {
        const { results } = await requestGet<AwxItemsResponse<Organization>>(
          awxAPI`/organizations/`
        );
        organizationId = results[0].id;
      }

      const labelsToCreate: Promise<Label>[] = [];
      for (const label of promptLabels) {
        if (label.id) {
          labelIds.add(label.id);
          continue;
        }

        const existingId = existingLabelMap.get(label.name);
        if (existingId !== undefined) {
          labelIds.add(existingId);
          continue;
        }

        // Label needs to be created
        labelsToCreate.push(
          postRequest(awxAPI`/labels/`, {
            name: label.name,
            organization: organizationId,
          })
        );
      }

      try {
        const createdLabels = await Promise.all(labelsToCreate);
        createdLabels.forEach((label) => labelIds.add(label.id));
      } catch (err) {
        alertToaster.addAlert({
          variant: 'danger',
          title: t('Failed to create new label'),
          children: err instanceof Error && err.message,
        });
      }

      return Array.from(labelIds);
    },
    [t, alertToaster, allLabels, postRequest]
  );
}
