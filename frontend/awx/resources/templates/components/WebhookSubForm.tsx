import { Button } from '@patternfly/react-core';
import { SyncAltIcon } from '@patternfly/react-icons';
import { useCallback, useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router-dom';
import { PageFormSelect, PageFormTextInput } from '../../../../../framework';
import { PageFormSection } from '../../../../../framework/PageForm/Utils/PageFormSection';
import { postRequest, requestGet } from '../../../../common/crud/Data';
import { PageFormCredentialSelect } from '../../../access/credentials/components/PageFormCredentialSelect';
import { awxAPI } from '../../../common/api/awx-utils';
import { JobTemplateForm } from '../../../interfaces/JobTemplateForm';
import { WorkflowJobTemplateForm } from '../../../interfaces/WorkflowJobTemplate';
import { useWebhookServiceOptions } from './WebhookService';

interface WebhookKey {
  webhook_key: string;
}

export function WebhookSubForm(props: {
  templateType: 'job_templates' | 'workflow_job_templates';
}) {
  const { t } = useTranslation();
  const params = useParams<{ id?: string }>();
  const { setValue, getValues, reset } = useFormContext();
  const webhookKey = useWatch({ name: 'webhook_key' }) as string;
  const webhookService = useWatch({ name: 'webhook_service' }) as string;
  const isWebhookEnabled = useWatch({ name: 'isWebhookEnabled' }) as boolean;
  const { templateType } = props;

  const { pathname } = useLocation();
  const webhookServices = useWebhookServiceOptions();

  useEffect(() => {
    async function handleFetchWebhookKey() {
      const whkData = await requestGet<WebhookKey>(
        awxAPI`/${templateType}/${params.id ?? ''}/webhook_key/`
      );
      reset({
        ...getValues(),
        webhook_key: whkData.webhook_key || webhookKey || (getValues('webhook_key') as string),
      });
    }
    if (!pathname.endsWith('/create')) void handleFetchWebhookKey();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (webhookService)
      setValue(
        'related.webhook_receiver',
        pathname.endsWith('/create')
          ? t`a new webhook url will be generated on save.`.toUpperCase()
          : `${document.location.origin}${awxAPI`/${templateType}/`}${
              params.id as string
            }/${webhookService}/`
      );

    if (pathname.endsWith('/create'))
      setValue('webhook_key', t`a new webhook key will be generated on save.`.toUpperCase());
  }, [webhookService, setValue, pathname, params.id, t, templateType]);

  const handleGenerateWebhookKey = useCallback(async () => {
    if (isWebhookEnabled && params.id) {
      const { webhook_key: webhookKey } = await postRequest<WebhookKey>(
        awxAPI`/${templateType}/${params.id}/webhook_key/`,
        {}
      );
      setValue('webhook_key', webhookKey);
      return;
    }
  }, [isWebhookEnabled, setValue, params, templateType]);

  const isUpdateKeyDisabled =
    pathname.endsWith('/create') || webhookKey === 'A NEW WEBHOOK KEY WILL BE GENERATED ON SAVE.';
  return (
    <PageFormSection title={t('Webhook details')}>
      <PageFormSelect<JobTemplateForm>
        name="webhook_service"
        label={t('Webhook service')}
        options={webhookServices}
        isRequired={isWebhookEnabled}
        placeholderText={t('Select a webhook service')}
      />
      <PageFormTextInput<JobTemplateForm>
        name="related.webhook_receiver"
        isDisabled={!params.id || !webhookService}
        label={t('Webhook URL')}
        isReadOnly
        placeholder={t('Select a webhook service')}
      />
      <PageFormTextInput<JobTemplateForm>
        name="webhook_key"
        label={t('Webhook key')}
        isReadOnly
        button={
          <Button
            ouiaId="update-webhook-key-button"
            isDisabled={isUpdateKeyDisabled}
            variant="tertiary"
            aria-label={t`Update webhook key`}
            onClick={() => {
              void handleGenerateWebhookKey();
            }}
          >
            <SyncAltIcon />
          </Button>
        }
      />
      {webhookService ? (
        <PageFormCredentialSelect<JobTemplateForm | WorkflowJobTemplateForm>
          id="webhook_credential"
          name="webhook_credential"
          label={t('Webhook credential')}
          placeholder={t('Select webhook credential')}
          isDisabled={!webhookService ? t('Disabled') : undefined}
          queryParams={{
            credential_type__namespace: `${webhookService}_token`,
          }}
        />
      ) : null}
    </PageFormSection>
  );
}
