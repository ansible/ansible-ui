import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageHeader, PageLayout, useGetPageUrl } from '../../../../framework';
import { PageRoutedTabs } from '../../../common/PageRoutedTabs';
import { useGet } from '../../../common/crud/useGet';
import { edaAPI } from '../../common/eda-utils';
import { EdaEventStream } from '../../interfaces/EdaEventStream';
import { EdaEventStreamInstance } from '../../interfaces/EdaEventStreamInstance';
import { EdaRoute } from '../../main/EdaRoutes';

export function EventStreamInstancePage() {
  const { t } = useTranslation();
  const params = useParams<{ instanceId: string }>();
  const { data: eventStreamInstance } = useGet<EdaEventStreamInstance>(
    edaAPI`/activation-instances/${params.instanceId ?? ''}/`
  );
  const { data: eventStream } = useGet<EdaEventStream>(
    edaAPI`/event-streams/${eventStreamInstance?.event_stream_id ?? ''}/`
  );

  const getPageUrl = useGetPageUrl();

  return (
    <PageLayout>
      <PageHeader
        title={`${eventStreamInstance?.id || ''} - ${eventStreamInstance?.name || ''}`}
        breadcrumbs={[
          { label: t('Event Streams'), to: getPageUrl(EdaRoute.EventStreams) },
          {
            label: eventStream?.name || '',
            to: getPageUrl(EdaRoute.EventStreamPage, { params: { id: eventStream?.id } }),
          },
          {
            label: t('History'),
            to: getPageUrl(EdaRoute.EventStreamHistory, {
              params: { id: eventStream?.id },
            }),
          },
          { label: `${eventStreamInstance?.id || ''} - ${eventStreamInstance?.name || ''}` },
        ]}
      />
      <PageRoutedTabs
        tabs={[
          {
            label: t('Details'),
            page: EdaRoute.EventStreamInstanceDetails,
            dataCy: 'event-stream-page-details',
          },
        ]}
        params={{ id: eventStreamInstance?.event_stream_id, instanceId: params.instanceId }}
      />
    </PageLayout>
  );
}
