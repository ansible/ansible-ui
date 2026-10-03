import { useAbortController } from '@ansible/ansible-ui-framework/hooks/useAbortController';
import { requestGet } from '@ansible/common-ui/crud/Data';
import { isRequestError, RequestError } from '@ansible/common-ui/crud/RequestError';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { awxErrorAdapter } from '../../../common/adapters/awxErrorAdapter';
import { awxAPI } from '../../../common/api/awx-utils';
import { Label } from '../../../interfaces/Label';

import { ScheduleLabel } from '../types';

// ponytail: Pagination stays local to labels; extract only for another non-React consumer.
async function getLabelPages(url: string, signal?: AbortSignal): Promise<Label[]> {
  const page = await requestGet<AwxItemsResponse<Label>>(url, signal);
  return page.next ? [...page.results, ...(await getLabelPages(page.next, signal))] : page.results;
}

export function getScheduleLabels(scheduleId: number, signal?: AbortSignal): Promise<Label[]> {
  return getLabelPages(
    `${awxAPI`/schedules/${scheduleId.toString()}/labels/`}?page_size=200`,
    signal
  );
}

const nameKey = (label: ScheduleLabel) => JSON.stringify([label.name, label.organization]);
const identityKey = (label: ScheduleLabel) => (label.id ? `id:${label.id}` : nameKey(label));

function getLabelDelta(current: Label[], selected: ScheduleLabel[], organization?: number | null) {
  const byId = new Map(current.map((label) => [label.id, label]));
  const byName = new Map(current.map((label) => [nameKey(label), label]));
  const desired = selected.map((label) => {
    const scoped = {
      ...label,
      organization: label.organization === undefined ? organization : label.organization,
    };
    const existing = label.id ? byId.get(label.id) : byName.get(nameKey(scoped));
    return existing ?? (label.id ? label : { name: label.name, organization });
  });
  const unique = new Map(desired.map((label) => [identityKey(label), label]));
  return {
    removed: current.filter((label) => !unique.has(identityKey(label))),
    added: [...unique.values()].filter((label) => !label.id || !byId.has(label.id)),
  };
}

function labelRequestError(title: string, detail: string, statusCode = 400) {
  const json = { detail };
  return new RequestError(title, detail, statusCode, json, json);
}

function isAlreadyMissingLabel(error: unknown) {
  // AWX get_object_or_400(Label, pk=...) raises ParseError with Django's exact message.
  return (
    isRequestError(error) &&
    error.statusCode === 400 &&
    error.json !== undefined &&
    error.json !== null &&
    'detail' in error.json &&
    error.json.detail === 'Label matching query does not exist.'
  );
}

function getFailedLabels(results: PromiseSettledResult<unknown>[]) {
  return results
    .flatMap((result) => {
      if (result.status === 'fulfilled') return [];
      const { genericErrors, fieldErrors } = awxErrorAdapter(result.reason);
      if (
        isRequestError(result.reason) &&
        typeof result.reason.json === 'object' &&
        result.reason.json !== null &&
        'msg' in result.reason.json &&
        typeof result.reason.json.msg === 'string'
      ) {
        return [result.reason.json.msg];
      }
      return [[...genericErrors, ...fieldErrors].map((error) => error.message).join('; ')];
    })
    .join('\n');
}

export const useProcessLabels = () => {
  const { t } = useTranslation();
  const abortController = useAbortController();
  const postLabel = usePostRequest<
    { id: number; disassociate?: boolean } | { name: string; organization: number | null }
  >();

  return useCallback(
    async (
      scheduleId: number,
      labels: ScheduleLabel[] | undefined,
      organization?: number | null
    ) => {
      if (labels === undefined) return;
      const current = await getScheduleLabels(scheduleId, abortController.signal);
      const { removed, added } = getLabelDelta(current, labels, organization);
      if (
        (organization === undefined || organization === null) &&
        added.some((label) => !label.id)
      ) {
        const message = t('An organization is required to create schedule labels.');
        throw labelRequestError(message, message);
      }
      const url = awxAPI`/schedules/${scheduleId.toString()}/labels/`;
      const removals = await Promise.allSettled(
        removed.map((label) =>
          postLabel(url, { id: label.id, disassociate: true }, abortController.signal).catch(
            (error: unknown) => {
              if (!isAlreadyMissingLabel(error)) throw error;
            }
          )
        )
      );
      const failedRemovals = getFailedLabels(removals);
      if (failedRemovals) {
        throw labelRequestError(t('Failed to remove labels'), failedRemovals);
      }
      const additions = await Promise.allSettled(
        added.map((label) =>
          postLabel(
            url,
            label.id ? { id: label.id } : { name: label.name, organization: organization! },
            abortController.signal
          )
        )
      );
      const failedAdditions = getFailedLabels(additions);
      if (failedAdditions) {
        throw labelRequestError(t('Failed to add labels'), failedAdditions);
      }
    },
    [postLabel, abortController, t]
  );
};
