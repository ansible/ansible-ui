import { compareStrings } from '@ansible/ansible-ui-framework';
import { useNameColumn } from '@ansible/common-ui/columns';
import { usePatchRequest } from '@ansible/common-ui/crud/usePatchRequest';
import { idKeyFn } from '@ansible/common-ui/utils/nameKeyFn';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { edaAPI } from '../../common/eda-utils';
import { useEdaBulkConfirmation } from '../../common/useEdaBulkConfirmation';
import { EdaEventStream } from '../../interfaces/EdaEventStream';
import { useEventStreamColumns } from './useEventStreamColumns';

export function useDisableEventStreams(onComplete?: (eventStreams: EdaEventStream[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useEventStreamColumns({ disableLinks: true });
  const disableActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true });
  const actionColumns = useMemo(() => [disableActionNameColumn], [disableActionNameColumn]);
  const patchRequest = usePatchRequest<unknown, unknown>();
  const bulkAction = useEdaBulkConfirmation<EdaEventStream>();
  return useCallback(
    (eventStreams: EdaEventStream[]) => {
      bulkAction({
        title: t('Disable forwarding of events?', { count: eventStreams.length }),
        prompt: t(
          'Are you sure you want to disable the forwarding of events? ' +
            'The evens from this event stream will no longer get forwarded to the rulebook activation this event stream is currently configured in.'
        ),
        confirmText: t('Yes, I confirm I want to disable the forwarding of events.', {
          count: eventStreams.length,
        }),
        actionButtonText: t('Disable forwarding of events', { count: eventStreams.length }),
        items: eventStreams.sort((l, r) => compareStrings(l.name, r.name)),
        keyFn: idKeyFn,
        isDanger: true,
        confirmationColumns,
        actionColumns,
        onComplete,
        actionFn: (eventStream: EdaEventStream) => {
          return patchRequest(
            edaAPI`/event-streams/${eventStream?.id ? eventStream?.id.toString() : ''}/`,
            {
              test_mode: true,
            }
          );
        },
      });
    },
    [actionColumns, bulkAction, confirmationColumns, onComplete, patchRequest, t]
  );
}
