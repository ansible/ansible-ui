import { TFunction, useTranslation } from 'react-i18next';
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
import { requestPatch } from '../../../common/crud/Data';
import { useGet } from '../../../common/crud/useGet';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { API_PREFIX } from '../../constants';
import { EdaCredential } from '../../interfaces/EdaCredential';

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
        label={t('Type')}
        isRequired
        placeholderText={t('Select credential type')}
        options={CredentialOptions(t)}
        labelHelp={t(
          'The credential type that is supported with the automation controller. It enables synchronization of cloud inventory.'
        )}
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
        labelHelp={t(
          'Tokens allow you to authenticate yourself and adjust the degree of restrictive permissions in addition to the base RBAC permissions.'
        )}
      />
    </>
  );
}

export function EditCredential() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const { data: credential } = useGet<EdaCredential>(`${API_PREFIX}/credentials/${id.toString()}/`);

  const { cache } = useSWRConfig();
  const postRequest = usePostRequest<Partial<EdaCredential>, EdaCredential>();

  const onSubmit: PageFormSubmitHandler<EdaCredential> = async (credential) => {
    if (Number.isInteger(id)) {
      await requestPatch<EdaCredential>(`${API_PREFIX}/credentials/${id}/`, credential);
      (cache as unknown as { clear: () => void }).clear?.();
      navigate(-1);
    } else {
      const newCredential = await postRequest(`${API_PREFIX}/credentials/`, credential);
      (cache as unknown as { clear: () => void }).clear?.();
      navigate(RouteObj.EdaCredentialDetails.replace(':id', newCredential.id.toString()));
    }
  };
  const onCancel = () => navigate(-1);

  if (Number.isInteger(id)) {
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
  } else {
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
}
