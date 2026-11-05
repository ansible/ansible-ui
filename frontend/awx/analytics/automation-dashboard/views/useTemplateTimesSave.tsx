import { usePageAlertToaster } from '@ansible/ansible-ui-framework';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePutRequest } from '../../../../common/crud/usePutRequest';
import { awxErrorAdapter } from '../../../common/adapters/awxErrorAdapter';
import { metricsAPI } from '../../../common/api/metrics-utils';
import { IAutomationDashboardView, IJobTemplate } from '../types';
import { useSerializedSave } from './useSerializedSave';

/** Allowed range (minutes) for the editable template times, inline and in bulk. */
export const TEMPLATE_TIME_MIN_MINUTES = 1;
export const TEMPLATE_TIME_MAX_MINUTES = 1000000;

export interface IJobTemplateModify {
  time_taken_manually_execute_minutes: number;
  time_taken_create_automation_minutes: number;
}

interface ITemplateTimesSave {
  item: IJobTemplate;
  data: IJobTemplateModify;
}

type TemplateTimesErrors = Record<number, Partial<Record<keyof IJobTemplateModify, string>>>;

/**
 * Saves the editable time columns of the cost table. Saves are serialized per
 * template, so rapid edits of a row are stored in order and never lost.
 */
export function useTemplateTimesSave(
  mainTableView: IAutomationDashboardView['mainTableView'],
  refresh: IAutomationDashboardView['refresh']
) {
  const { t } = useTranslation();
  const putRequest = usePutRequest<IJobTemplateModify, IJobTemplateModify>();
  const alertToaster = usePageAlertToaster();

  const [errors, setErrors] = useState<TemplateTimesErrors | null>(null);

  // Template times edited locally but not yet confirmed by the server, keyed by
  // template id. Every PUT is built on top of them, so quickly editing both time
  // columns of a row cannot resend a stale value for the other column.
  const unsavedTemplateTimesRef = useRef(new Map<number, IJobTemplateModify>());

  // Bumped after a bulk update so the table inputs remount and drop local edits and errors.
  const [editVersion, setEditVersion] = useState(0);

  const { enqueue: enqueueTemplateSave, waitForIdle } = useSerializedSave<
    ITemplateTimesSave,
    IJobTemplateModify
  >({
    save: ({ item, data }) =>
      putRequest(metricsAPI`/dashboard_reports/template_metadata/${item.id.toString()}/`, data),
    onSuccess: async (updatedData, { item }) => {
      unsavedTemplateTimesRef.current.delete(item.id);
      mainTableView.updateItem({ ...item, ...updatedData });

      // Refresh: a failure here does not undo the save.
      try {
        await refresh();
      } catch {
        alertToaster.addAlert({
          variant: 'warning',
          title: t('Update saved but failed to refresh view.'),
          timeout: 5000,
        });
      }
    },
    onError: (err, { item }) => {
      unsavedTemplateTimesRef.current.delete(item.id);
      const { genericErrors, fieldErrors } = awxErrorAdapter(err);
      alertToaster.addAlert({
        variant: 'danger',
        title: t('Failed to update template metadata for {{templateName}}.', {
          templateName: item.template_name,
        }),
        children: (
          <>
            {genericErrors.map((e) => (
              <div key={String(e.message)}>{e.message}</div>
            ))}
          </>
        ),
        timeout: 5000,
      });
      setErrors({
        [item.id]: fieldErrors.reduce<Partial<Record<keyof IJobTemplateModify, string>>>(
          (acc, e) => ({ ...acc, [e.name]: String(e.message) }),
          {}
        ),
      });
    },
  });

  const onTableInputChange = (
    item: IJobTemplate,
    columnKey: keyof IJobTemplateModify,
    value: number
  ) => {
    setErrors(null);
    const data: IJobTemplateModify = {
      ...(unsavedTemplateTimesRef.current.get(item.id) ?? {
        time_taken_manually_execute_minutes: item.time_taken_manually_execute_minutes,
        time_taken_create_automation_minutes: item.time_taken_create_automation_minutes,
      }),
      [columnKey]: value,
    };
    unsavedTemplateTimesRef.current.set(item.id, data);
    enqueueTemplateSave(item.id, { item, data });
  };

  /**
   * Shows bulk-applied values in every row right away and drops local edits and errors, so
   * the cells reflect the new values before the refresh returns.
   */
  const { pageItems, updateItem } = mainTableView;
  const applyBulkValues = useCallback(
    (values: Partial<IJobTemplateModify>) => {
      pageItems?.forEach((item) => updateItem({ ...item, ...values }));
      unsavedTemplateTimesRef.current.clear();
      setErrors(null);
      setEditVersion((version) => version + 1);
    },
    [pageItems, updateItem]
  );

  return {
    errors,
    onTableInputChange,
    // Lets a bulk update wait for in-flight PUTs. Their follow-up refreshes are not awaited:
    // the bulk refresh starts later, and SWR discards responses of older requests.
    waitForPendingSaves: waitForIdle,
    applyBulkValues,
    editVersion,
  };
}
