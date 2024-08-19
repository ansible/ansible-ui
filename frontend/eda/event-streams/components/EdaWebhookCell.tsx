import { TextCell, useGetPageUrl } from '../../../../framework';
import { useGet } from '../../../common/crud/useGet';
import { EdaEventStream } from '../../interfaces/EdaEventStream';
import { EdaRoute } from '../../main/EdaRoutes';

export function EdaEventStreamCell(props: { webhook_id?: number | null }) {
  const getPageUrl = useGetPageUrl();
  const { data } = useGet<EdaEventStream>(
    props.webhook_id ? `/api/eda/v1/event-streams/${props.webhook_id}/` : undefined,
    { dedupingInterval: 10 * 1000 }
  );
  if (!data) {
    switch (typeof props.webhook_id) {
      case 'number':
      case 'string':
        return <>{props.webhook_id}</>;
    }
    return <></>;
  }
  return (
    <TextCell
      text={data.name}
      to={
        props.webhook_id
          ? getPageUrl(EdaRoute.WebhookPage, {
              params: { id: data.id },
            })
          : undefined
      }
    />
  );
}
