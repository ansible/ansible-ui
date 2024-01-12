import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageAlertToaster } from '../../../../../framework';
import { requestGet } from '../../../../common/crud/Data';
import { usePostRequest } from '../../../../common/crud/usePostRequest';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';

import { awxAPI } from '../../../common/api/awx-utils';
import type { JobTemplate } from '../../../interfaces/JobTemplate';
import type { Label } from '../../../interfaces/Label';
import type { Organization } from '../../../interfaces/Organization';

type LabelPayload = (
  labels: { name: string; id?: number }[],
  template: JobTemplate
) => Promise<number[]>;

export function useLabelPayload() {
  const { t } = useTranslation();
  const alertToaster = usePageAlertToaster();
  const postRequest = usePostRequest<{ name: string; organization: number }, Label>();

  return useCallback<LabelPayload>(
    async (labels: { name: string; id?: number }[], template: JobTemplate) => {
      let createdLabels: Label[] = [];
      let organizationId = template?.summary_fields?.organization?.id;
      const existingLabels = labels.filter((label) => label.id);
      const newLabels = labels.filter((label) => !label.id);

      try {
        if (!organizationId) {
          const data = await requestGet<AwxItemsResponse<Organization>>(awxAPI`/organizations/`);
          organizationId = data.results[0].id;
        }

        const labelRequests = [];
        for (const label of newLabels || []) {
          labelRequests.push(
            postRequest(awxAPI`/labels/`, {
              name: label.name,
              organization: organizationId,
            })
          );
        }

        createdLabels = await Promise.all(labelRequests);
      } catch (err) {
        alertToaster.addAlert({
          variant: 'danger',
          title: t('Failed to create new label'),
          children: err instanceof Error && err.message,
        });
      }

      const labelIds = [...existingLabels, ...createdLabels]
        .map((label) => label.id)
        .filter((id) => typeof id === 'number' && !isNaN(id)) as number[];

      return labelIds;
    },
    [t, alertToaster, postRequest]
  );
}
