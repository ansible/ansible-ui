import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import {
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
      <PageDetails numberOfColumns={'single'} disableScroll={true}>
        {webhook?.test_content && (
          <PageDetailCodeEditor
            value={webhook?.test_content}
            showCopyToClipboard={true}
            label={t('Test content')}
            helpText={t('Test content')}
          />
        )}
      </PageDetails>
    </Scrollable>
  );
}
