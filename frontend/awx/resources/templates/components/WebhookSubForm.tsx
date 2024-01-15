import { Button } from '@patternfly/react-core';
import { SyncAltIcon } from '@patternfly/react-icons';
import { useCallback, useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router-dom';
import { PageFormSelect, PageFormTextInput } from '../../../../../framework';
import { PageFormSection } from '../../../../../framework/PageForm/Utils/PageFormSection';
import { requestGet } from '../../../../common/crud/Data';
import { useGet } from '../../../../common/crud/useGet';
import { PageFormCredentialSelect } from '../../../access/credentials/components/PageFormCredentialSelect';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { awxAPI } from '../../../common/api/awx-utils';
import { CredentialType } from '../../../interfaces/CredentialType';
import { JobTemplateForm } from '../../../interfaces/JobTemplateForm';
import { WorkflowJobTemplateForm } from '../../../interfaces/WorkflowJobTemplate';

export function WebhookSubForm() {
  const { t } = useTranslation();
  const params = useParams<{ id?: string }>();
  const { setValue } = useFormContext<JobTemplateForm | WorkflowJobTemplateForm>();
  const webhookKey = useWatch({ name: 'webhook_key' }) as string;
  const webhookService = useWatch({ name: 'webhook_service' }) as string;
  const isWebhookEnabled = useWatch({ name: 'enable_webhook' }) as boolean;

  const { pathname } = useLocation();

  const { data: webhookCredentialType } = useGet<AwxItemsResponse<CredentialType>>(
    awxAPI`/credential_types/`,
    {
      namespace: `${webhookService}_token`,
    }
  );

  const handleFetchWebhookKey = useCallback(async () => {
    if (isWebhookEnabled && params.id) {
      const webhookKey = await requestGet<string>(awxAPI`/job_template/${params.id}/webhook_key`);
      setValue('webhook_key', webhookKey);
      return;
    }
  }, [isWebhookEnabled, setValue, params]);

  useGet<AwxItemsResponse<CredentialType>>(
    awxAPI`/credential_types/?namespace=${webhookService}_token`
  );

  useEffect(() => {
    if (!webhookService) return;
    setValue(
      'related.webhook_receiver',
      pathname.endsWith('/creat')
        ? t`a new webhook url will be generated on save.`.toUpperCase()
        : `${document.location.origin}${awxAPI`/job_template/`}${
            params.id as string
          }/${webhookService}/`
    );
  }, [webhookService, setValue, pathname, params.id, t]);

  const isUpdateKeyDisabled =
    pathname.endsWith('/create') || webhookKey === 'A NEW WEBHOOK KEY WILL BE GENERATED ON SAVE.';
  return (
    <PageFormSection title={t('Webhook details')}>
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
        <PageFormCredentialSelect<JobTemplateForm | WorkflowJobTemplateForm>
          label={t('Webhook credential')}
          credentialType={webhookCredentialType?.results[0].id as unknown as number}
          name="webhook_credential.name"
          credentialIdPath="webhook_credential.id"
          isDisabled={!webhookService}
          placeholder={t('Add webhook credential')}
          labelHelpTitle={t('Webhook credential')}
        />
      ) : null}
    </PageFormSection>
  );
}
