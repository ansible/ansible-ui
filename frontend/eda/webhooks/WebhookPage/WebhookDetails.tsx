import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { LoadingPage, PageDetail, PageDetails, Scrollable } from '../../../../framework';
import { formatDateString } from '../../../../framework/utils/formatDateString';
import { LastModifiedPageDetail } from '../../../common/LastModifiedPageDetail';
import { useGet } from '../../../common/crud/useGet';
import { edaAPI } from '../../common/eda-utils';
import { EdaWebhook } from '../../interfaces/EdaWebhook';
import { DescriptionListGroup, DescriptionListTerm, PageSection } from '@patternfly/react-core';
import { StandardPopover } from '../../../../framework/components/StandardPopover';
import { PageDetailCodeEditor } from '../../../../framework/PageDetails/PageDetailCodeEditor';

export function WebhookDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: webhook } = useGet<EdaWebhook>(edaAPI`/webhooks/${params.id ?? ''}/`);
  if (!webhook) {
    return <LoadingPage />;
  }
  return (
    <Scrollable>
      <PageDetails>
        <PageDetail label={t('Name')}>{webhook?.name || ''}</PageDetail>
        <PageDetail label={t('Url')}>{webhook?.url || ''}</PageDetail>
        <PageDetail label={t('Hmac algorithm')}>{webhook?.hmac_algorithm || ''}</PageDetail>
        <PageDetail label={t('Hmac signature prefix')}>
          {webhook?.hmac_signature_prefix || ''}
        </PageDetail>
        <PageDetail label={t('hmac_format')}>{webhook?.hmac_format || ''}</PageDetail>
        <PageDetail label={t('Header key')}>{webhook?.header_key || ''}</PageDetail>
        <PageDetail label={t('Auth type')}>{webhook?.auth_type || ''}</PageDetail>
        <PageDetail label={t('Created')}>
          {webhook?.created_at ? formatDateString(webhook.created_at) : ''}
        </PageDetail>
        <LastModifiedPageDetail value={webhook?.modified_at ? webhook.modified_at : ''} />
        {!!webhook?.test_mode && (
          <PageDetail label={t('Mode')}>
            <DescriptionListGroup>
              <DescriptionListTerm style={{ opacity: 0.6 }}>
                {t('Test mode')}
                <StandardPopover header={t('Test mode')} content={t('Test mode.')} />
              </DescriptionListTerm>
            </DescriptionListGroup>
          </PageDetail>
        )}
        <PageDetail label={t('Test content type')}>{webhook?.test_content_type || ''}</PageDetail>
        <PageDetail label={t('Test error message')}>{webhook?.test_error_message || ''}</PageDetail>
      </PageDetails>

      {webhook?.test_content && (
        <PageSection variant="light">
          <PageDetailCodeEditor
            value={webhook?.test_content}
            showCopyToClipboard={true}
            label={t('Test content')}
            helpText={t('Test content')}
          />
        </PageSection>
      )}
    </Scrollable>
  );
}
