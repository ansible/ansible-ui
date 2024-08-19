import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { edaAPI } from '../../../eda/common/eda-utils';
import { useEventStreamFilters } from './useEventStreamFilters';
import { useEventStreamColumns } from './useEventStreamColumns';
import { EdaEventStream } from '../../interfaces/EdaEventStream';
import { useEdaView } from '../../common/useEventDrivenView';
import { MultiSelectDialog, usePageDialog } from '../../../../framework';

export function useSelectEventStreams(webhookType?: number, title?: string) {
  const [_, setDialog] = usePageDialog();
  const { t } = useTranslation();
  const openSelectEventStreams = useCallback(
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
  return openSelectEventStreams;
}

function SelectEdaEventStreams(props: {
  title: string;
  onSelect: (webhooks: EdaEventStream[]) => void;
  defaultEdaEventStream?: EdaEventStream;
  webhookType?: number;
}) {
  const toolbarFilters = useEventStreamFilters();
  const tableColumns = useEventStreamColumns();
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
