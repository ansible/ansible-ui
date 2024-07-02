import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { edaAPI } from '../../../eda/common/eda-utils';
import { useWebhookFilters } from './useWebhookFilters';
import { useWebhookColumns } from './useWebhookColumns';
import { EdaWebhook } from '../../interfaces/EdaWebhook';
import { useEdaView } from '../../common/useEventDrivenView';
import { MultiSelectDialog, usePageDialogs } from '../../../../framework';

export function useSelectWebhooks(webhookType?: number, title?: string) {
  const { pushDialog } = usePageDialogs();
  const { t } = useTranslation();
  const openSelectWebhooks = useCallback(
    (onSelect: (webhooks: EdaWebhook[]) => void) => {
      pushDialog(
        <SelectEdaWebhooks
          title={t(title ? title : 'Select webhook')}
          onSelect={onSelect}
          webhookType={webhookType}
        />
      );
    },
    [webhookType, pushDialog, t, title]
  );
  return openSelectWebhooks;
}

function SelectEdaWebhooks(props: {
  title: string;
  onSelect: (webhooks: EdaWebhook[]) => void;
  defaultEdaWebhook?: EdaWebhook;
  webhookType?: number;
}) {
  const toolbarFilters = useWebhookFilters();
  const tableColumns = useWebhookColumns();
  const view = useEdaView<EdaWebhook>({
    url: edaAPI`/webhooks/`,
    toolbarFilters,
    tableColumns: tableColumns,
    disableQueryString: true,
    ...(props.webhookType && {
      queryParams: {
        webhook_type: props.webhookType.toString(),
      },
    }),
  });
  return (
    <MultiSelectDialog<EdaWebhook>
      {...props}
      toolbarFilters={toolbarFilters}
      tableColumns={tableColumns}
      view={view}
    />
  );
}
