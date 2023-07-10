import { Button, FormSection } from '@patternfly/react-core';
import { SyncAltIcon } from '@patternfly/react-icons';
import { useCallback, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router-dom';
import { PageFormSelect, PageFormTextInput } from '../../../../../framework';
import { ItemsResponse, requestGet } from '../../../../common/crud/Data';
import { useGet } from '../../../../common/crud/useGet';
import { CredentialType } from '../../../interfaces/CredentialType';
import { JobTemplateForm } from '../../../interfaces/JobTemplateForm';
import { PageFormCredentialSelect } from '../../credentials/components/PageFormCredentialSelect';

export function WebhookSubForm() {
  const { t } = useTranslation();
  const params = useParams<{ id?: string }>();
  const { watch, setValue } = useFormContext<JobTemplateForm>();
  const webhookKey = watch('webhook_key');
  const webhookService = watch('webhook_service');
  const isWebhookEnabled = watch('isWebhookEnabled');

  const { pathname } = useLocation();

  const { data: webhookCredentialType } = useGet<ItemsResponse<CredentialType>>(
    `/api/v2/credential_types/`,
    {
      namespace: `${webhookService as string}_token`,
    }
  );

  const handleFetchWebhookKey = useCallback(async () => {
    if (isWebhookEnabled && params.id) {
      const webhookKey = await requestGet<string>(`/api/v2/job_template/${params.id}/webhook_key`);
      setValue('webhook_key', webhookKey);
      return;
    }
  }, [isWebhookEnabled, setValue, params]);

  useGet<ItemsResponse<CredentialType>>(
    `/api/v2/credential_types/?namespace=${webhookService as string}_token`
  );

  useEffect(() => {
    if (!webhookService) return;
    setValue(
      'related.webhook_receiver',
      pathname.endsWith('/add')
        ? t`a new webhook url will be generated on save.`.toUpperCase()
        : `${document.location.origin}/api/v2/job_template/${
            params.id as string
          }/${webhookService}/`
    );
  }, [webhookService, setValue, pathname, params.id, t]);

  const isUpdateKeyDisabled =
    pathname.endsWith('/add') || webhookKey === 'A NEW WEBHOOK KEY WILL BE GENERATED ON SAVE.';
  return (
    <FormSection title={t('Webhook details')}>
      <PageFormSelect<JobTemplateForm>
        name="webhook_service"
        label={t('Webhook service')}
        options={[
          { label: 'GitHub', value: 'github' },
          { label: 'GitLab', value: 'gitlab' },
        ]}
        isRequired={isWebhookEnabled}
        placeholderText={t('Select a webhook service')}
      />
      <PageFormTextInput<JobTemplateForm>
        name="related.webhook_receiver"
        isDisabled={!params.id || !webhookService}
        label={t('Webhook URL')}
        placeholder={t('Select a webhook service')}
      />
      <PageFormTextInput<JobTemplateForm>
        name="webhook_key"
        label={t('Webhook key')}
        button={
          <Button
            ouiaId="update-webhook-key-button"
            isDisabled={isUpdateKeyDisabled}
            variant="tertiary"
            aria-label={t`Update webhook key`}
            onClick={() => {
              void handleFetchWebhookKey();
            }}
          >
            <SyncAltIcon />
          </Button>
        }
      />
      {webhookCredentialType?.results.length ? (
        <PageFormCredentialSelect<JobTemplateForm>
          label={t('Webhook credential')}
          credentialType={webhookCredentialType?.results[0].id as unknown as number}
          name="summary_fields.webhook_credential.name"
          credentialIdPath="summary_fields.webhook_credential.id"
          isDisabled={!webhookService}
          placeholder={t('Add webhook credential')}
          labelHelpTitle={t('Webhook credential')}
        />
      ) : null}
    </FormSection>
  );
}
