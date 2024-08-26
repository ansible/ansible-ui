import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import {
  CopyCell,
  LoadingPage,
  PageDetail,
  PageDetails,
  Scrollable,
  useGetPageUrl,
} from '../../../../framework';
import { formatDateString } from '../../../../framework/utils/formatDateString';
import { LastModifiedPageDetail } from '../../../common/LastModifiedPageDetail';
import { useGet } from '../../../common/crud/useGet';
import { edaAPI } from '../../common/eda-utils';
import { EdaEventStream } from '../../interfaces/EdaEventStream';
import { Alert } from '@patternfly/react-core';
import { PageDetailCodeEditor } from '../../../../framework/PageDetails/PageDetailCodeEditor';
import { EdaRoute } from '../../main/EdaRoutes';

export function EventStreamDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const getPageUrl = useGetPageUrl();
  const { data: eventStream } = useGet<EdaEventStream>(edaAPI`/event-streams/${params.id ?? ''}/`);
  if (!eventStream) {
    return <LoadingPage />;
  }
  return (
    <Scrollable>
      {eventStream?.test_mode && (
        <Alert
          variant={'warning'}
          isInline
          style={{ marginLeft: '24px', marginTop: '16px', marginRight: '16px' }}
          title={t('This event stream is disabled.')}
        >
          <p>
            {t(
              'Event streams that are disabled do not forward events to the rulebook activation where they are ' +
                'configured. To forward events to the rulebook activation, enable the forwarding of events. '
            )}
          </p>
        </Alert>
      )}
      <PageDetails disableScroll={true}>
        <PageDetail label={t('Name')}>{eventStream?.name || ''}</PageDetail>
        <PageDetail label={t('Event stream type')}>
          {eventStream?.event_stream_type || ''}
        </PageDetail>
        <PageDetail label={t('Organization')}>
          {eventStream && eventStream.organization ? (
            <Link
              to={getPageUrl(EdaRoute.OrganizationPage, {
                params: { id: `${eventStream?.organization?.id}` },
              })}
            >
              {eventStream?.organization?.name}
            </Link>
          ) : (
            eventStream?.organization?.name || ''
          )}
        </PageDetail>
        <PageDetail label={t('Credential')}>
          {eventStream && eventStream.eda_credential ? (
            <Link
              to={getPageUrl(EdaRoute.CredentialPage, {
                params: { id: eventStream?.eda_credential?.id },
              })}
            >
              {eventStream?.eda_credential?.name}
            </Link>
          ) : (
            eventStream?.eda_credential?.name || ''
          )}
        </PageDetail>
        <PageDetail label={t('Url')}>
          <CopyCell text={eventStream?.url || ''} />
        </PageDetail>
        <PageDetail
          label={t('Headers')}
          helpText={t(
            'A comma separated HTTP header keys that you want to include in the event payload.'
          )}
        >
          {eventStream?.additional_data_headers || ''}
        </PageDetail>
        <PageDetail label={t('Events received')}>{eventStream?.events_received}</PageDetail>
        <PageDetail label={t('Last event received')}>
          {eventStream?.last_event_received_at
            ? formatDateString(eventStream.last_event_received_at)
            : ''}
        </PageDetail>
        <PageDetail label={t('Created')}>
          {eventStream?.created_at ? formatDateString(eventStream.created_at) : ''}
        </PageDetail>
        <LastModifiedPageDetail value={eventStream?.modified_at ? eventStream.modified_at : ''} />
        <PageDetail
          label={t('Test content type')}
          helpText={t('The HTTP Body that was sent from the Sender.')}
        >
          {eventStream?.test_content_type || ''}
        </PageDetail>
        <PageDetail label={t('Test error message')}>
          {eventStream?.test_error_message || ''}
        </PageDetail>
      </PageDetails>
      <PageDetails numberOfColumns={'single'} disableScroll={true}>
        {eventStream?.test_headers && (
          <PageDetailCodeEditor
            value={eventStream?.test_headers}
            showCopyToClipboard={true}
            label={t('Test headers')}
            toggleLanguage={false}
            helpText={t(
              'The HTTP Headers received from the Sender. Any of these can be used in the "Headers" field.'
            )}
          />
        )}
      </PageDetails>
      <PageDetails numberOfColumns={'single'} disableScroll={true}>
        {eventStream?.test_content && (
          <PageDetailCodeEditor
            value={eventStream?.test_content}
            showCopyToClipboard={true}
            toggleLanguage={false}
            label={t('Test content')}
            helpText={t('Test content')}
          />
        )}
      </PageDetails>
    </Scrollable>
  );
}
