import { AlertProps } from '@patternfly/react-core';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings, usePageAlertToaster } from '../../../../framework';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { edaAPI } from '../../common/eda-utils';
import { EdaEventStream } from '../../interfaces/EdaEventStream';
import { useEventStreamColumns } from './useEventStreamColumns';
import { useEdaBulkConfirmation } from '../../common/useEdaBulkConfirmation';

export function useEnableEventStreams(onComplete: (eventStreams: EdaEventStream[]) => void) {
  const { t } = useTranslation();
  const postRequest = usePostRequest<undefined, undefined>();
  const alertToaster = usePageAlertToaster();
  return useCallback(
    async (eventStreams: EdaEventStream[]) => {
      await Promise.allSettled(
        eventStreams.map(async (eventStream) => {
          const alert: AlertProps = {
            variant: 'success',
            title: `${eventStream.name} ${t('enabled')}.`,
            timeout: 5000,
          };
          await postRequest(
            edaAPI`/event-streams/${eventStream?.id ? eventStream?.id.toString() : ''}/enable/`,
            undefined
          )
            .then(() => alertToaster.addAlert(alert))
            .catch(() => {
              alertToaster.addAlert({
                variant: 'danger',
                title: `${t('Failed to enable')} ${eventStream.name}`,
                timeout: 5000,
              });
            });
        })
      );
      onComplete(eventStreams);
    },
    [alertToaster, onComplete, postRequest, t]
  );
}

export function useDisableEventStreams(onComplete: (eventStreams: EdaEventStream[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useEventStreamColumns();
  const actionColumns = useMemo(() => [confirmationColumns[0]], [confirmationColumns]);
  const bulkAction = useEdaBulkConfirmation<EdaEventStream>();
  const postRequest = usePostRequest<undefined, undefined>();
  return useCallback(
    (eventStreams: EdaEventStream[]) => {
      bulkAction({
        title: t('Disable event streams', { count: eventStreams.length }),
        confirmText: t('Yes, I confirm that I want to disable these {{count}} event streams.', {
          count: eventStreams.length,
        }),
        actionButtonText: t('Disable event streams', { count: eventStreams.length }),
        items: eventStreams.sort((l, r) => compareStrings(l.name, r.name)),
        keyFn: (item) => item?.id,
        isDanger: true,
        confirmationColumns,
        actionColumns,
        onComplete,
        actionFn: (eventStream: EdaEventStream) =>
          postRequest(edaAPI`/event-streams/${eventStream.id.toString()}/disable/`, undefined),
      });
    },
    [actionColumns, bulkAction, confirmationColumns, postRequest, onComplete, t]
  );
}

export function useRestartEventStreams(onComplete: (eventStreams: EdaEventStream[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useEventStreamColumns();
  const actionColumns = useMemo(() => [confirmationColumns[0]], [confirmationColumns]);
  const bulkAction = useEdaBulkConfirmation<EdaEventStream>();
  const postRequest = usePostRequest<undefined, undefined>();
  return useCallback(
    (eventStreams: EdaEventStream[]) => {
      bulkAction({
        title: t('Restart event streams', { count: eventStreams.length }),
        confirmText: t('Yes, I confirm that I want to restart these {{count}} event streams.', {
          count: eventStreams.length,
        }),
        actionButtonText: t('Restart event streams', { count: eventStreams.length }),
        items: eventStreams.sort((l, r) => compareStrings(l.name, r.name)),
        keyFn: (item) => item?.id,
        confirmationColumns,
        actionColumns,
        onComplete,
        actionFn: (eventStream: EdaEventStream) =>
          postRequest(edaAPI`/event-streams/${eventStream.id.toString()}/restart/`, undefined),
      });
    },
    [actionColumns, bulkAction, confirmationColumns, postRequest, onComplete, t]
  );
}
