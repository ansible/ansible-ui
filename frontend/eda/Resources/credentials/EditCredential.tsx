import { TFunction, Trans, useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useSWRConfig } from 'swr';
import {
  PageForm,
  PageFormSelectOption,
  PageFormSubmitHandler,
  PageFormTextInput,
  PageHeader,
  PageLayout,
} from '../../../../framework';
import { RouteObj } from '../../../Routes';
import { useGet } from '../../../common/crud/useGet';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { API_PREFIX } from '../../constants';
import { EdaCredential } from '../../interfaces/EdaCredential';
import { usePatchRequest } from '../../../common/crud/usePatchRequest';

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
    <Trans i18nKey="credentialTypeHelpBlock">
      <p>The credential type defines what the credential will be used for.</p>
      <br />
      <p>There are three types:</p>
      <p>GitHub Personal Access Token</p>
      <p>GitLab Personal Access Token</p>
      <p>Container Registry</p>
    </Trans>
  );
  return (
    <>
      <PageFormTextInput<EdaCredential>
        name="name"
        label={t('Name')}
        placeholder={t('Enter name')}
        isRequired
        maxLength={150}
        autoComplete="new-name"
      />
      <PageFormTextInput<EdaCredential>
        name="description"
        label={t('Description')}
        placeholder={t('Enter description ')}
        maxLength={150}
      />
      <PageFormSelectOption<EdaCredential>
        name="credential_type"
        label={t('Credential type')}
        isRequired
        placeholderText={t('Select credential type')}
        options={CredentialOptions(t)}
        labelHelp={credentialTypeHelpBlock}
        labelHelpTitle={t('Credential type')}
      />
      <PageFormTextInput<EdaCredential>
        name="username"
        label={t('User name')}
        isRequired
        placeholder={t('Enter username')}
      />
      <PageFormTextInput<EdaCredential>
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
  const postRequest = usePostRequest<Partial<EdaCredential>, EdaCredential>();

  const onSubmit: PageFormSubmitHandler<EdaCredential> = async (credential) => {
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
  const { data: credential } = useGet<EdaCredential>(`${API_PREFIX}/credentials/${id.toString()}/`);

  const { cache } = useSWRConfig();
  const patchRequest = usePatchRequest<Partial<EdaCredential>, EdaCredential>();

  const onSubmit: PageFormSubmitHandler<EdaCredential> = async (credential) => {
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
