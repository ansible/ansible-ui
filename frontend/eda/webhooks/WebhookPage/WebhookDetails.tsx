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
import { EdaWebhook } from '../../interfaces/EdaWebhook';
import { DescriptionListGroup, DescriptionListTerm } from '@patternfly/react-core';
import { StandardPopover } from '../../../../framework/components/StandardPopover';
import { PageDetailCodeEditor } from '../../../../framework/PageDetails/PageDetailCodeEditor';
import { EdaRoute } from '../../main/EdaRoutes';

export function WebhookDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const getPageUrl = useGetPageUrl();

  const { data: webhook } = useGet<EdaWebhook>(edaAPI`/webhooks/${params.id ?? ''}/`);
  if (!webhook) {
    return <LoadingPage />;
  }
  return (
    <Scrollable>
      <PageDetails disableScroll={true}>
        <PageDetail label={t('Name')}>{webhook?.name || ''}</PageDetail>
        <PageDetail label={t('Event stream type')}>{webhook?.webhook_type || ''}</PageDetail>
        <PageDetail label={t('Organization')}>
          {webhook && webhook.organization ? (
            <Link
              to={getPageUrl(EdaRoute.OrganizationPage, {
                params: { id: webhook?.organization?.id },
              })}
            >
              {webhook?.organization?.name}
            </Link>
          ) : (
            webhook?.organization?.name || ''
          )}
        </PageDetail>
        <PageDetail label={t('Credential')}>
          {webhook && webhook.eda_credential ? (
            <Link
              to={getPageUrl(EdaRoute.CredentialPage, {
                params: { id: webhook?.eda_credential?.id },
              })}
            >
              {webhook?.eda_credential?.name}
            </Link>
          ) : (
            webhook?.eda_credential?.name || ''
          )}
        </PageDetail>
        <PageDetail label={t('Url')}>
          <CopyCell text={webhook?.url || ''} />
        </PageDetail>
        <PageDetail
          label={t('Include headers')}
          helpText={t(
            'A comma separated HTTP header keys that you want to include in the event payload.'
          )}
        >
          {webhook?.additional_data_headers || ''}
        </PageDetail>
        <PageDetail label={t('Events received')}>{webhook?.events_received}</PageDetail>
        <PageDetail label={t('Last event received')}>
          {webhook?.last_event_received_at ? formatDateString(webhook.last_event_received_at) : ''}
        </PageDetail>
        <PageDetail label={t('Created')}>
          {webhook?.created_at ? formatDateString(webhook.created_at) : ''}
        </PageDetail>
        <LastModifiedPageDetail value={webhook?.modified_at ? webhook.modified_at : ''} />
        {!!webhook?.test_mode && (
          <PageDetail label={t('Mode')}>
            <DescriptionListGroup>
              <DescriptionListTerm style={{ opacity: 0.6 }}>
                {t('Test mode')}
                <StandardPopover
                  header={t('Test mode')}
                  content={t(
                    ' In Test Mode events are not forwarded to the Activation. This mode helps in viewing the headers and payload'
                  )}
                />
              </DescriptionListTerm>
            </DescriptionListGroup>
          </PageDetail>
        )}
        <PageDetail
          label={t('Test content type')}
          helpText={t('The HTTP Body that was sent from the Sender.')}
        >
          {webhook?.test_content_type || ''}
        </PageDetail>
        <PageDetail label={t('Test error message')}>{webhook?.test_error_message || ''}</PageDetail>
      </PageDetails>
      <PageDetails numberOfColumns={'single'} disableScroll={true}>
        {webhook?.test_headers && (
          <PageDetailCodeEditor
            value={webhook?.test_headers}
            showCopyToClipboard={true}
            label={t('Test headers')}
            toggleLanguage={false}
            helpText={t(
              'The HTTP Headers received from the Sender. Any of these can be used in the "Include headers" field.'
            )}
          />
        )}
      </PageDetails>
      <PageDetails numberOfColumns={'single'} disableScroll={true}>
        {webhook?.test_content && (
          <PageDetailCodeEditor
            value={webhook?.test_content}
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
