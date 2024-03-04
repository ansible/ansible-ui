import { TextCell, useGetPageUrl } from '../../../../framework';
import { useGet } from '../../../common/crud/useGet';
import { EdaWebhook } from '../../interfaces/EdaWebhook';
import { EdaRoute } from '../../main/EdaRoutes';

export function EdaWebhookCell(props: { webhook_id?: number | null }) {
  const getPageUrl = useGetPageUrl();
  const { data } = useGet<EdaWebhook>(
    props.webhook_id ? `/api/eda/v1/webhooks/${props.webhook_id}/` : undefined,
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
