import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings } from '../../../../framework';
import { useNameColumn } from '../../../common/columns';
import { requestDelete } from '../../../common/crud/Data';
import { idKeyFn } from '../../../common/utils/nameKeyFn';
import { edaAPI } from '../../common/eda-utils';
import { EdaWebhook } from '../../interfaces/EdaWebhook';
import { useWebhookColumns } from './useWebhookColumns';
import { useEdaBulkConfirmation } from '../../common/useEdaBulkConfirmation';

export function useDeleteWebhooks(onComplete?: (webhooks: EdaWebhook[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useWebhookColumns();
  const deleteActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true });
  const actionColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn]);
  const bulkAction = useEdaBulkConfirmation<EdaWebhook>();
  return useCallback(
    (webhooks: EdaWebhook[]) => {
      bulkAction({
        title: t('Permanently delete event streams', { count: webhooks.length }),
        confirmText: t('Yes, I confirm that I want to delete these {{count}} event streams.', {
          count: webhooks.length,
        }),
        actionButtonText: t('Delete event streams', { count: webhooks.length }),
        items: webhooks.sort((l, r) => compareStrings(l.name, r.name)),
        keyFn: idKeyFn,
        isDanger: true,
        confirmationColumns,
        actionColumns,
        onComplete,
        actionFn: (webhook: EdaWebhook, signal) => {
          const url = edaAPI`/webhooks/` + `${webhook.id.toString()}/`;
          return requestDelete(url, signal);
        },
      });
    },
    [actionColumns, bulkAction, confirmationColumns, onComplete, t]
  );
}
