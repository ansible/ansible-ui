import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { edaAPI } from '../../../eda/common/eda-utils';
import { useEventStreamFilters } from './useEventStreamFilters';
import { useEventStreamColumns } from './useEventStreamColumns';
import { EdaEventStream } from '../../interfaces/EdaEventStream';
import { useEdaView } from '../../common/useEventDrivenView';
import { MultiSelectDialog, usePageDialog } from '../../../../framework';

export function useSelectEventStreams(eventStreamType?: number, title?: string) {
  const [_, setDialog] = usePageDialog();
  const { t } = useTranslation();
  const openSelectEventStreams = useCallback(
    (onSelect: (eventStreams: EdaEventStream[]) => void) => {
      setDialog(
        <SelectEdaEventStreams
          title={t(title ? title : 'Select event stream')}
          onSelect={onSelect}
          eventStreamType={eventStreamType}
        />
      );
    },
    [eventStreamType, setDialog, t, title]
  );
  return openSelectEventStreams;
}

function SelectEdaEventStreams(props: {
  title: string;
  onSelect: (eventStreams: EdaEventStream[]) => void;
  defaultEdaEventStream?: EdaEventStream;
  eventStreamType?: number;
}) {
  const toolbarFilters = useEventStreamFilters();
  const tableColumns = useEventStreamColumns();
  const view = useEdaView<EdaEventStream>({
    url: edaAPI`/event-streams/`,
    toolbarFilters,
    tableColumns: tableColumns,
    disableQueryString: true,
    ...(props.eventStreamType && {
      queryParams: {
        event_stream_type: props.eventStreamType.toString(),
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
