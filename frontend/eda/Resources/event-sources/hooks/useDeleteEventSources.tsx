import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings, useBulkConfirmation } from '../../../../../framework';
import { requestDelete } from '../../../../common/crud/Data';
import { idKeyFn } from '../../../../common/utils/nameKeyFn';
import { InUseResources } from '../../../common/EdaResourcesComon';
import { EdaEventSource, EdaEventSourceRead } from '../../../interfaces/EdaEventSource';
import { useEventSourceColumns, useEventSourcesColumns } from './useEventSourcesColumns';
import { edaAPI } from '../../../common/eda-utils';

export function useDeleteEventSources(onComplete: (eventSources: EdaEventSource[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useEventSourcesColumns();
  const actionColumns = useMemo(() => [confirmationColumns[0]], [confirmationColumns]);
  const bulkAction = useBulkConfirmation<EdaEventSource>();
  return useCallback(
    async (eventSources: EdaEventSource[]) => {
      const inUseDes = await InUseResources(eventSources, edaAPI`/activations/?source_id=`);
      const inUseMessage =
        inUseDes && inUseDes.length > 0
          ? [t(`The following event sources are in use: ${inUseDes.join()}`)]
          : [];
      const forceParameter = inUseMessage.length > 0 ? '?force=true' : '';

      bulkAction({
        title: t('Permanently delete event sources', {
          count: eventSources.length,
        }),
        confirmText: t('Yes, I confirm that I want to delete these {{count}} event sources.', {
          count: eventSources.length,
        }),
        actionButtonText: t('Delete event sources', { count: eventSources.length }),
        items: eventSources.sort((l, r) => compareStrings(l.name, r.name)),
        keyFn: idKeyFn,
        isDanger: true,
        confirmationColumns,
        actionColumns,
        onComplete,
        alertPrompts: inUseMessage,
        actionFn: (eventSource, signal) => {
          const url = edaAPI`/sources/${eventSource.id.toString()}/`;
          return requestDelete(url + forceParameter, signal);
        },
      });
    },
    [actionColumns, bulkAction, confirmationColumns, onComplete, t]
  );
}

export function useDeleteEventSource(onComplete: (eventSources: EdaEventSourceRead[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useEventSourceColumns();
  const actionColumns = useMemo(() => [confirmationColumns[0]], [confirmationColumns]);
  const bulkAction = useBulkConfirmation<EdaEventSourceRead>();
  return useCallback(
    async (eventSources: EdaEventSourceRead[]) => {
      const inUseDes = await InUseResources(eventSources, edaAPI`/activations/?source_id=`);
      const inUseMessage =
        inUseDes && inUseDes.length > 0
          ? [t(`The following event sources are in use: ${inUseDes.join()}`)]
          : [];
      const forceParameter = inUseMessage.length > 0 ? '?force=true' : '';

      bulkAction({
        title: t('Permanently delete event sources', {
          count: eventSources.length,
        }),
        confirmText: t('Yes, I confirm that I want to delete these {{count}} event sources.', {
          count: eventSources.length,
        }),
        actionButtonText: t('Delete event sources', { count: eventSources.length }),
        items: eventSources.sort((l, r) => compareStrings(l.name, r.name)),
        keyFn: idKeyFn,
        isDanger: true,
        confirmationColumns,
        actionColumns,
        onComplete,
        alertPrompts: inUseMessage,
        actionFn: (eventSource, signal) => {
          const url = edaAPI`/sources/${eventSource.id.toString()}/`;
          return requestDelete(url + forceParameter, signal);
        },
      });
    },
    [actionColumns, bulkAction, confirmationColumns, onComplete, t]
  );
}
