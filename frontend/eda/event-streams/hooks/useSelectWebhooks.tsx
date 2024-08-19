import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { edaAPI } from '../../../eda/common/eda-utils';
import { useWebhookFilters } from './useWebhookFilters';
import { useWebhookColumns } from './useWebhookColumns';
import { EdaEventStream } from '../../interfaces/EdaEventStream';
import { useEdaView } from '../../common/useEventDrivenView';
import { MultiSelectDialog, usePageDialog } from '../../../../framework';

export function useSelectWebhooks(webhookType?: number, title?: string) {
  const [_, setDialog] = usePageDialog();
  const { t } = useTranslation();
  const openSelectWebhooks = useCallback(
    (onSelect: (webhooks: EdaEventStream[]) => void) => {
      setDialog(
        <SelectEdaEventStreams
          title={t(title ? title : 'Select event stream')}
          onSelect={onSelect}
          webhookType={webhookType}
        />
      );
    },
    [webhookType, setDialog, t, title]
  );
  return openSelectWebhooks;
}

function SelectEdaEventStreams(props: {
  title: string;
  onSelect: (webhooks: EdaEventStream[]) => void;
  defaultEdaEventStream?: EdaEventStream;
  webhookType?: number;
}) {
  const toolbarFilters = useWebhookFilters();
  const tableColumns = useWebhookColumns();
  const view = useEdaView<EdaEventStream>({
    url: edaAPI`/event-streams/`,
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
    <MultiSelectDialog<EdaEventStream>
      {...props}
      toolbarFilters={toolbarFilters}
      tableColumns={tableColumns}
      view={view}
    />
  );
}
