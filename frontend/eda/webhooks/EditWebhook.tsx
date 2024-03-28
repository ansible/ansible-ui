import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useSWRConfig } from 'swr';
import {
  PageFormCheckbox,
  PageFormSelect,
  PageFormSubmitHandler,
  PageFormTextInput,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../framework';
import { useGet } from '../../common/crud/useGet';
import { usePatchRequest } from '../../common/crud/usePatchRequest';
import { usePostRequest } from '../../common/crud/usePostRequest';
import { EdaPageForm } from '../common/EdaPageForm';
import { edaAPI } from '../common/eda-utils';
import { EdaWebhook, EdaWebhookCreate } from '../interfaces/EdaWebhook';
import { EdaRoute } from '../main/EdaRoutes';
import { TextList, TextListItem, TextListItemVariants } from '@patternfly/react-core';
import { StandardPopover } from '../../../framework/components/StandardPopover';
import { TFunction } from 'i18next/index';
import { WebhookTypeEnum } from '../interfaces/generated/eda-api';
import { PageFormHidden } from '../../../framework/PageForm/Utils/PageFormHidden';
import { PageFormSelectOrganization } from '../access/organizations/components/PageFormOrganizationSelect';

export function WebhookOptions(t: TFunction<'translation'>) {
  return [
    {
      label: t('GitHub'),
      description: t('GitHub'),
      value: WebhookTypeEnum.GitHub,
    },
    {
      label: t('GitLab'),
      description: t('GitLab'),
      value: WebhookTypeEnum.GitLab,
    },
    {
      label: t('ServiceNow'),
      description: t('ServiceNow'),
      value: WebhookTypeEnum.ServiceNow,
    },
    {
      label: t('Generic'),
      description: t('Generic'),
      value: WebhookTypeEnum.Generic,
    },
  ];
}
// eslint-disable-next-line react/prop-types
function WebhookInputs(props: { editMode: boolean }) {
  const { t } = useTranslation();
  return (
    <>
      <PageFormSelect<EdaWebhookCreate>
        name="type"
        data-cy="webhook-type-form-field"
        label={t('Webhook type')}
        isRequired
        isReadOnly={props?.editMode}
        placeholderText={t('Select webhook type')}
        options={WebhookOptions(t)}
        labelHelpTitle={t('Webhook type')}
      />
      <PageFormTextInput<EdaWebhookCreate>
        name="name"
        data-cy="name-form-field"
        label={t('Name')}
        placeholder={t('Enter name')}
        isRequired
        maxLength={150}
      />
      <PageFormSelectOrganization<EdaWebhookCreate> name="organization_id" />
      <PageFormTextInput<EdaWebhookCreate>
        name="secret"
        data-cy="secret-form-field"
        label={t('Secret')}
        type="password"
        placeholder={t('Enter webhook secret')}
        isRequired={!props?.editMode}
        labelHelp={t('Secret.')}
        labelHelpTitle={t('Secret')}
      />
      <PageFormHidden
        watch="type"
        hidden={(type: WebhookTypeEnum) => type !== WebhookTypeEnum.Generic}
      >
        <PageFormTextInput<EdaWebhookCreate>
          name="hmac_algorithm"
          data-cy="hmac_algorithm-form-field"
          label={t('Hmac algorithm')}
          placeholder={t('Enter hmac algorithm ')}
          maxLength={150}
        />
        <PageFormTextInput<EdaWebhookCreate>
          name="header_key"
          data-cy="header_key_algorithm-form-field"
          label={t('Header key')}
          placeholder={t('Enter header key ')}
          maxLength={150}
        />
        <PageFormTextInput<EdaWebhookCreate>
          name="auth_type"
          data-cy="auth_type_algorithm-form-field"
          label={t('Auth type')}
          placeholder={t('Enter auth type')}
          maxLength={150}
        />
        <PageFormTextInput<EdaWebhookCreate>
          name="hmac_signature_prefix"
          data-cy="hmac_signature_prefix-form-field"
          label={t('Hmac signature prefix')}
          placeholder={t('Enter hmac signature prefix')}
          maxLength={150}
        />
        <PageFormTextInput<EdaWebhookCreate>
          name="hmac_format"
          data-cy="hmac_format-form-field"
          label={t('Hmac format')}
          placeholder={t('Enter hmac format')}
          maxLength={150}
        />
      </PageFormHidden>
      <PageFormCheckbox<EdaWebhookCreate>
        label={
          <TextList>
            <TextListItem component={TextListItemVariants.li}>
              {t`Test mode`}
              <StandardPopover header="" content={t('Test mode.')} />
            </TextListItem>
          </TextList>
        }
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

  const onSubmit: PageFormSubmitHandler<EdaWebhookCreate> = async (webhook) => {
    if (webhook.type === WebhookTypeEnum.ServiceNow) {
      webhook.auth_type = 'token';
      webhook.header_key = 'Authorization';
    }
    if (webhook.type === WebhookTypeEnum.GitHub) {
      webhook.hmac_algorithm = 'sha256';
      webhook.header_key = 'X-Hub-Signature-256';
      webhook.auth_type = 'hmac';
      webhook.hmac_signature_prefix = 'sha256=';
      webhook.hmac_format = 'hex';
    }
    if (webhook.type === WebhookTypeEnum.GitLab) {
      webhook.auth_type = 'token';
      webhook.header_key = 'X-Gitlab-Token';
    }

    const newWebhook = await postRequest(edaAPI`/webhooks/`, webhook);
    (cache as unknown as { clear: () => void }).clear?.();
    pageNavigate(EdaRoute.WebhookPage, { params: { id: newWebhook.id } });
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
      >
        <WebhookInputs editMode={false} />
      </EdaPageForm>
    </PageLayout>
  );
}

export function EditWebhook() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const { data: webhook } = useGet<EdaWebhookCreate>(edaAPI`/webhooks/${id.toString()}/`);

  const { cache } = useSWRConfig();
  const patchRequest = usePatchRequest<EdaWebhookCreate, EdaWebhook>();

  const onSubmit: PageFormSubmitHandler<EdaWebhookCreate> = async (webhook) => {
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
          defaultValue={webhook}
        >
          <WebhookInputs editMode={true} />
        </EdaPageForm>
      </PageLayout>
    );
  }
}
