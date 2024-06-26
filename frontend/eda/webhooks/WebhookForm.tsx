import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import useSWR, { useSWRConfig } from 'swr';
import {
  PageFormCheckbox,
  PageFormSubmitHandler,
  PageFormTextInput,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../framework';
import { requestGet, swrOptions } from '../../common/crud/Data';
import { useGet, useGetItem } from '../../common/crud/useGet';
import { usePatchRequest } from '../../common/crud/usePatchRequest';
import { usePostRequest } from '../../common/crud/usePostRequest';
import { PageFormSelectOrganization } from '../access/organizations/components/PageFormOrganizationSelect';
import { EdaPageForm } from '../common/EdaPageForm';
import { edaAPI } from '../common/eda-utils';
import { EdaOrganization } from '../interfaces/EdaOrganization';
import { EdaResult } from '../interfaces/EdaResult';
import { EdaWebhook, EdaWebhookCreate } from '../interfaces/EdaWebhook';
import { EdaRoute } from '../main/EdaRoutes';
import { PageFormSelectWebhookType } from './components/PageFormWebhookTypeSelect';
import { PageFormSelectWebhookCredential } from './components/PageFormWebhookCredentialSelect';
import { useFormContext, useWatch } from 'react-hook-form';
import { EdaCredentialType } from '../interfaces/EdaCredentialType';
import { useEffect } from 'react';
import { PageFormHidden } from '../../../framework/PageForm/Utils/PageFormHidden';

// eslint-disable-next-line react/prop-types
function WebhookInputs() {
  const { t } = useTranslation();
  const typeId = useWatch<IEdaWebhookCreate>({
    name: 'type_id',
  }) as number;
  const { setValue } = useFormContext();
  const useWebhookTypeKind = (type_id: number) => {
    const { data } = useGetItem<EdaCredentialType>(edaAPI`/credential-types/`, type_id);
    return data;
  };

  const webhookType = useWebhookTypeKind(typeId);

  useEffect(() => {
    const resetCredential = () => {
      setValue('eda_credential_id', undefined);
      setValue('webhook_type', webhookType?.kind);
    };
    resetCredential();
  }, [typeId, setValue, webhookType?.kind]);

  return (
    <>
      <PageFormTextInput<IEdaWebhookCreate>
        name="name"
        data-cy="name-form-field"
        label={t('Name')}
        placeholder={t('Enter name')}
        isRequired
        labelHelpTitle={t('Name')}
        labelHelp={t(
          'The name should match the source name defined in the rulebook. If the source name matches we will swap the webhook in the rulebook with this webhook.'
        )}
        maxLength={150}
      />
      <PageFormSelectOrganization<IEdaWebhookCreate> name="organization_id" />
      <PageFormSelectWebhookType<IEdaWebhookCreate> name="type_id" isRequired />
      <PageFormHidden watch={'type'} hidden={() => true}>
        <PageFormTextInput<IEdaWebhookCreate>
          name="kind"
          data-cy="name-form-field"
          label={t('Kind')}
        />
      </PageFormHidden>
      <PageFormHidden watch={'type_id'} hidden={() => true}>
        <PageFormTextInput<IEdaWebhookCreate>
          name="webhook_type"
          data-cy="type-form-field"
          isRequired
          label={t('Webhook type')}
        />
      </PageFormHidden>
      <PageFormSelectWebhookCredential<IEdaWebhookCreate>
        isRequired
        name="eda_credential_id"
        type={webhookType?.kind || ''}
      />
      <PageFormTextInput<IEdaWebhookCreate>
        name="additional_data_headers"
        data-cy="additional_data_headers-form-field"
        label={t('Include headers')}
        placeholder={t('Enter include headers')}
        labelHelpTitle={t('Include headers')}
        labelHelp={t(
          'A comma separated HTTP header keys that you want to include in the event payload.'
        )}
      />
      <PageFormCheckbox<IEdaWebhookCreate>
        label={t`Test mode`}
        labelHelp={t('Test mode.')}
        name="test_mode"
      />
    </>
  );
}

function WebhookEditInputs() {
  const { t } = useTranslation();
  const webhookType = useWatch<IEdaWebhookCreate>({
    name: 'webhook_type',
  }) as string;
  return (
    <>
      <PageFormTextInput<IEdaWebhookCreate>
        name="name"
        data-cy="name-form-field"
        label={t('Name')}
        placeholder={t('Enter name')}
        isRequired
        maxLength={150}
      />
      <PageFormSelectOrganization<IEdaWebhookCreate> name="organization_id" />
      <PageFormTextInput<IEdaWebhookCreate>
        name="webhook_type"
        data-cy="type-form-field"
        isReadOnly
        label={t('Webhook type')}
      />
      <PageFormSelectWebhookCredential<IEdaWebhookCreate>
        name="eda_credential_id"
        isRequired
        type={webhookType}
      />
      <PageFormTextInput<IEdaWebhookCreate>
        name="additional_data_headers"
        data-cy="additional_data_headers-form-field"
        label={t('Include headers')}
        placeholder={t('Enter include headers')}
        labelHelpTitle={t('Include headers')}
        labelHelp={t(
          'A comma separated HTTP header keys that you want to include in the event payload.'
        )}
      />
      <PageFormCheckbox<IEdaWebhookCreate>
        label={t`Test mode`}
        labelHelp={t('Test mode.')}
        name="test_mode"
      />
    </>
  );
}

export function CreateWebhook() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();

  const { cache } = useSWRConfig();
  const postRequest = usePostRequest<EdaWebhookCreate, EdaWebhook>();
  const { data: organizations } = useSWR<EdaResult<EdaOrganization>>(
    edaAPI`/organizations/?name=Default`,
    requestGet,
    swrOptions
  );
  const defaultOrganization =
    organizations && organizations?.results && organizations.results.length > 0
      ? organizations.results[0]
      : undefined;

  const onSubmit: PageFormSubmitHandler<EdaWebhookCreate> = async (webhook) => {
    const newWebhook = await postRequest(edaAPI`/webhooks/`, webhook);
    (cache as unknown as { clear: () => void }).clear?.();
    pageNavigate(EdaRoute.WebhookPage, { params: { id: newWebhook?.id } });
  };
  const onCancel = () => navigate(-1);
  const getPageUrl = useGetPageUrl();

  return (
    <PageLayout>
      <PageHeader
        title={t('Create Webhook')}
        breadcrumbs={[
          { label: t('Webhooks'), to: getPageUrl(EdaRoute.Webhooks) },
          { label: t('Create Webhook') },
        ]}
      />
      <EdaPageForm
        submitText={t('Create webhook')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={onCancel}
        defaultValue={{ organization_id: defaultOrganization?.id }}
      >
        <WebhookInputs />
      </EdaPageForm>
    </PageLayout>
  );
}

export function EditWebhook() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const { data: webhook } = useGet<EdaWebhook>(edaAPI`/webhooks/${id.toString()}/`);

  const { cache } = useSWRConfig();
  const patchRequest = usePatchRequest<IEdaWebhookCreate, EdaWebhook>();

  const onSubmit: PageFormSubmitHandler<IEdaWebhookCreate> = async (webhook) => {
    await patchRequest(edaAPI`/webhooks/${id.toString()}/`, webhook);
    (cache as unknown as { clear: () => void }).clear?.();
    navigate(-1);
  };
  const onCancel = () => navigate(-1);
  const getPageUrl = useGetPageUrl();

  if (!webhook) {
    return (
      <PageLayout>
        <PageHeader
          breadcrumbs={[
            { label: t('Webhooks'), to: getPageUrl(EdaRoute.Webhooks) },
            { label: t('Edit Webhook') },
          ]}
        />
      </PageLayout>
    );
  } else {
    return (
      <PageLayout>
        <PageHeader
          title={`${t('Edit')} ${webhook?.name || t('Webhook')}`}
          breadcrumbs={[
            { label: t('Webhooks'), to: getPageUrl(EdaRoute.Webhooks) },
            { label: `${t('Edit')} ${webhook?.name || t('Webhook')}` },
          ]}
        />
        <EdaPageForm
          submitText={t('Save webhook')}
          onSubmit={onSubmit}
          cancelText={t('Cancel')}
          onCancel={onCancel}
          defaultValue={{
            ...webhook,
            organization_id: webhook?.organization?.id,
            eda_credential_id: webhook?.eda_credential?.id,
          }}
        >
          <WebhookEditInputs />
        </EdaPageForm>
      </PageLayout>
    );
  }
}

type IEdaWebhookCreate = EdaWebhookCreate & {
  type_id: number;
  kind: string;
};
