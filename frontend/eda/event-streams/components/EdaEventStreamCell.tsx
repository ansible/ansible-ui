import { TextCell, useGetPageUrl } from '../../../../framework';
import { useGet } from '../../../common/crud/useGet';
import { EdaEventStream } from '../../interfaces/EdaEventStream';
import { EdaRoute } from '../../main/EdaRoutes';

export function EdaEventStreamCell(props: { event_stream_id?: number | null }) {
  const getPageUrl = useGetPageUrl();
  const { data } = useGet<EdaEventStream>(
    props.event_stream_id ? `/api/eda/v1/event-streams/${props.event_stream_id}/` : undefined,
    { dedupingInterval: 10 * 1000 }
  );
  if (!data) {
    switch (typeof props.event_stream_id) {
      case 'number':
      case 'string':
        return <>{props.event_stream_id}</>;
    }
    return <></>;
  }
  return (
    <TextCell
      text={data.name}
      to={
        props.event_stream_id
          ? getPageUrl(EdaRoute.EventStreamPage, {
              params: { id: data.id },
            })
          : undefined
      }
    />
  );
}
