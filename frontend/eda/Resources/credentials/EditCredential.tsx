import { TFunction, useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useSWRConfig } from 'swr';
import {
  PageForm,
  PageFormSelect,
  PageFormSubmitHandler,
  PageFormTextInput,
  PageHeader,
  PageLayout,
} from '../../../../framework';
import { RouteObj } from '../../../Routes';
import { useGet } from '../../../common/crud/useGet';
import { usePatchRequest } from '../../../common/crud/usePatchRequest';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { API_PREFIX } from '../../constants';
import { EdaCredential, EdaCredentialCreate } from '../../interfaces/EdaCredential';

export function CredentialOptions(t: TFunction<'translation'>) {
  return [
    {
      label: t('GitHub personal access token'),
      description: t('GitHub personal access token'),
      value: 'GitHub Personal Access Token',
    },
    {
      label: t('GitLab personal access token'),
      description: t('GitLab personal access token'),
      value: 'GitLab Personal Access Token',
    },
    {
      label: t('Container registry'),
      description: t('Container registry token'),
      value: 'Container Registry',
    },
  ];
}
function CredentialInputs() {
  const { t } = useTranslation();
  const credentialTypeHelpBlock = (
    <>
      <p>{t('The credential type defines what the credential will be used for.')}</p>
      <br />
      <p>{t('There are three types:')}</p>
      <p>{t('GitHub Personal Access Token')}</p>
      <p>{t('GitLab Personal Access Token')}</p>
      <p>{t('Container Registry')}</p>
    </>
  );
  return (
    <>
      <PageFormTextInput<EdaCredentialCreate>
        name="name"
        label={t('Name')}
        placeholder={t('Enter name')}
        isRequired
        maxLength={150}
        autoComplete="new-name"
      />
      <PageFormTextInput<EdaCredentialCreate>
        name="description"
        label={t('Description')}
        placeholder={t('Enter description ')}
        maxLength={150}
      />
      <PageFormSelect<EdaCredentialCreate>
        name="credential_type"
        label={t('Credential type')}
        isRequired
        placeholderText={t('Select credential type')}
        options={CredentialOptions(t)}
        labelHelp={credentialTypeHelpBlock}
        labelHelpTitle={t('Credential type')}
      />
      <PageFormTextInput<EdaCredentialCreate>
        name="username"
        label={t('Username')}
        isRequired
        placeholder={t('Enter username')}
      />
      <PageFormTextInput<EdaCredentialCreate>
        name="secret"
        label={t('Token')}
        type="password"
        placeholder={t('Enter credential token')}
        isRequired
        labelHelp={t('Tokens allow you to authenticate to your destination.')}
        labelHelpTitle={t('Token')}
      />
    </>
  );
}

export function CreateCredential() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { cache } = useSWRConfig();
  const postRequest = usePostRequest<EdaCredentialCreate, EdaCredential>();

  const onSubmit: PageFormSubmitHandler<EdaCredentialCreate> = async (credential) => {
    const newCredential = await postRequest(`${API_PREFIX}/credentials/`, credential);
    (cache as unknown as { clear: () => void }).clear?.();
    navigate(RouteObj.EdaCredentialDetails.replace(':id', newCredential.id.toString()));
  };
  const onCancel = () => navigate(-1);
  return (
    <PageLayout>
      <PageHeader
        title={t('Create Credential')}
        breadcrumbs={[
          { label: t('Credentials'), to: RouteObj.EdaCredentials },
          { label: t('Create Credential') },
        ]}
      />
      <PageForm
        submitText={t('Create credential')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={onCancel}
      >
        <CredentialInputs />
      </PageForm>
    </PageLayout>
  );
}

export function EditCredential() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const { data: credential } = useGet<EdaCredentialCreate>(
    `${API_PREFIX}/credentials/${id.toString()}/`
  );

  const { cache } = useSWRConfig();
  const patchRequest = usePatchRequest<EdaCredentialCreate, EdaCredential>();

  const onSubmit: PageFormSubmitHandler<EdaCredentialCreate> = async (credential) => {
    await patchRequest(`${API_PREFIX}/credentials/${id}/`, credential);
    (cache as unknown as { clear: () => void }).clear?.();
    navigate(-1);
  };
  const onCancel = () => navigate(-1);

  if (!credential) {
    return (
      <PageLayout>
        <PageHeader
          breadcrumbs={[
            { label: t('Credentials'), to: RouteObj.EdaCredentials },
            { label: t('Edit Credential') },
          ]}
        />
      </PageLayout>
    );
  } else {
    return (
      <PageLayout>
        <PageHeader
          title={`${t('Edit')} ${credential?.name || t('Credential')}`}
          breadcrumbs={[
            { label: t('Credentials'), to: RouteObj.EdaCredentials },
            { label: `${t('Edit')} ${credential?.name || t('Credential')}` },
          ]}
        />
        <PageForm
          submitText={t('Save credential')}
          onSubmit={onSubmit}
          cancelText={t('Cancel')}
          onCancel={onCancel}
          defaultValue={credential}
        >
          <CredentialInputs />
        </PageForm>
      </PageLayout>
    );
  }
}
