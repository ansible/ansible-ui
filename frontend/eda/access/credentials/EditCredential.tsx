import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useSWRConfig } from 'swr';
import {
  PageFormSelect,
  PageFormSubmitHandler,
  PageFormTextInput,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../framework';
import { useGet } from '../../../common/crud/useGet';
import { usePatchRequest } from '../../../common/crud/usePatchRequest';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { EdaPageForm } from '../../common/EdaPageForm';
import { edaAPI } from '../../common/eda-utils';
import { EdaCredential, EdaCredentialCreate } from '../../interfaces/EdaCredential';
import { CredentialTypeEnum } from '../../interfaces/generated/eda-api';
import { EdaRoute } from '../../main/EdaRoutes';
import { PageFormHidden } from '../../../../framework/PageForm/Utils/PageFormHidden';

export function CredentialOptions(t: TFunction<'translation'>) {
  return [
    {
      label: t('GitHub personal access token'),
      description: t('GitHub personal access token'),
      value: CredentialTypeEnum.GitHubPersonalAccessToken,
    },
    {
      label: t('GitLab personal access token'),
      description: t('GitLab personal access token'),
      value: CredentialTypeEnum.GitLabPersonalAccessToken,
    },
    {
      label: t('Container registry'),
      description: t('Container registry token'),
      value: CredentialTypeEnum.ContainerRegistry,
    },
    {
      label: t('Ansible Vault Password'),
      description: t('Ansible vault password'),
      value: CredentialTypeEnum.AnsibleVaultPassword,
    },
  ];
}
function CredentialInputs() {
  const { t } = useTranslation();
  const credentialTypeHelpBlock = (
    <>
      <p>{t('The credential type defines what the credential will be used for.')}</p>
      <br />
      <p>{t('There are five types:')}</p>
      <p>{t('GitHub Personal Access Token')}</p>
      <p>{t('GitLab Personal Access Token')}</p>
      <p>{t('Container Registry')}</p>
      <p>{t('Extra Var')}</p>
      <p>{t('Ansible Vault Password')}</p>
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
      <PageFormHidden
        watch="credential_type"
        hidden={(type: CredentialTypeEnum) =>
          type !== CredentialTypeEnum.GitHubPersonalAccessToken &&
          type !== CredentialTypeEnum.GitLabPersonalAccessToken &&
          type !== CredentialTypeEnum.ContainerRegistry
        }
      >
        <PageFormTextInput<EdaCredentialCreate>
          name="username"
          label={t('Username')}
          placeholder={t('Enter username')}
        />
        <PageFormTextInput<EdaCredentialCreate>
          name="secret"
          label={t('Token/Password')}
          type="password"
          placeholder={t('Enter credential token or password')}
          isRequired
          labelHelp={t('Tokens/passwords allow you to authenticate to your destination.')}
          labelHelpTitle={t('Token/Password')}
        />
      </PageFormHidden>
      <PageFormHidden
        watch="credential_type"
        hidden={(type: CredentialTypeEnum) => type !== CredentialTypeEnum.AnsibleVaultPassword}
      >
        <PageFormTextInput<EdaCredentialCreate>
          name="key"
          label={t('Vault identifier')}
          placeholder={t('Vault identifier')}
        />
        <PageFormTextInput<EdaCredentialCreate>
          name="secret"
          label={t('Vault password')}
          type="password"
          placeholder={t('Enter vault password')}
          isRequired
          labelHelp={t('Vault password')}
          labelHelpTitle={t('Vault password')}
        />
      </PageFormHidden>
    </>
  );
}

export function CreateCredential() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();

  const { cache } = useSWRConfig();
  const postRequest = usePostRequest<EdaCredentialCreate, EdaCredential>();

  const onSubmit: PageFormSubmitHandler<EdaCredentialCreate> = async (credential) => {
    const newCredential = await postRequest(edaAPI`/credentials/`, credential);
    (cache as unknown as { clear: () => void }).clear?.();
    pageNavigate(EdaRoute.CredentialPage, { params: { id: newCredential.id } });
  };
  const onCancel = () => navigate(-1);
  const getPageUrl = useGetPageUrl();

  return (
    <PageLayout>
      <PageHeader
        title={t('Create Credential')}
        breadcrumbs={[
          { label: t('Credentials'), to: getPageUrl(EdaRoute.Credentials) },
          { label: t('Create Credential') },
        ]}
      />
      <EdaPageForm
        submitText={t('Create credential')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={onCancel}
      >
        <CredentialInputs />
      </EdaPageForm>
    </PageLayout>
  );
}

export function EditCredential() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const { data: credential } = useGet<EdaCredentialCreate>(edaAPI`/credentials/${id.toString()}/`);

  const { cache } = useSWRConfig();
  const patchRequest = usePatchRequest<EdaCredentialCreate, EdaCredential>();

  const onSubmit: PageFormSubmitHandler<EdaCredentialCreate> = async (credential) => {
    await patchRequest(edaAPI`/credentials/${id.toString()}/`, credential);
    (cache as unknown as { clear: () => void }).clear?.();
    navigate(-1);
  };
  const onCancel = () => navigate(-1);
  const getPageUrl = useGetPageUrl();

  if (!credential) {
    return (
      <PageLayout>
        <PageHeader
          breadcrumbs={[
            { label: t('Credentials'), to: getPageUrl(EdaRoute.Credentials) },
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
            { label: t('Credentials'), to: getPageUrl(EdaRoute.Credentials) },
            { label: `${t('Edit')} ${credential?.name || t('Credential')}` },
          ]}
        />
        <EdaPageForm
          submitText={t('Save credential')}
          onSubmit={onSubmit}
          cancelText={t('Cancel')}
          onCancel={onCancel}
          defaultValue={credential}
        >
          <CredentialInputs />
        </EdaPageForm>
      </PageLayout>
    );
  }
}
