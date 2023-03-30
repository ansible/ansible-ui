import { useTranslation } from 'react-i18next';
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
import { requestPatch } from '../../../common/crud/Data';
import { useGet } from '../../../common/crud/useGet';
import { RouteObj } from '../../../Routes';
import { API_PREFIX } from '../../constants';
import { EdaCredential } from '../../interfaces/EdaCredential';
import { usePostRequest } from '../../../common/crud/usePostRequest';

function CredentialInputs() {
  const { t } = useTranslation();
  return (
    <>
      <PageFormTextInput<EdaCredential>
        name="name"
        label={t('Name')}
        placeholder={t('Insert name here')}
        isRequired
        maxLength={150}
        autoComplete="new-name"
      />
      <PageFormTextInput<EdaCredential>
        name="description"
        label={t('Description')}
        placeholder={t('Insert description here ')}
        maxLength={150}
      />
      <PageFormSelectOption<EdaCredential>
        name="credential_type"
        label={t('Type')}
        placeholderText={t('Select a credential type')}
        options={[
          {
            label: t('Github Personal Access Token'),
            description: t('Github Personal Access Token'),
            value: 'Github',
          },
          {
            label: t('Gitlab Personal Access Token'),
            description: t('Gitlab Personal Access Token'),
            value: 'Gitlab',
          },
        ]}
        isRequired
      />
      <PageFormTextInput<EdaCredential>
        name="username"
        label={t('User name')}
        placeholder={t('Insert user name here')}
      />
      <PageFormTextInput<EdaCredential>
        name="secret"
        label={t('Secret')}
        placeholder={t('Insert credential secret here')}
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

  const onSubmit: PageFormSubmitHandler<EdaCredential> = async (credential, setError) => {
    try {
      if (Number.isInteger(id)) {
        await requestPatch<EdaCredential>(`${API_PREFIX}/credentials/${id}/`, credential);
        (cache as unknown as { clear: () => void }).clear?.();
        navigate(-1);
      } else {
        const newCredential = await postRequest(`${API_PREFIX}/credentials/`, credential);
        (cache as unknown as { clear: () => void }).clear?.();
        navigate(RouteObj.EdaCredentialDetails.replace(':id', newCredential.id.toString()));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Unknown error'));
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
              { label: t('Edit credential') },
            ]}
          />
        </PageLayout>
      );
    } else {
      return (
        <PageLayout>
          <PageHeader
            title={t('Edit credential')}
            breadcrumbs={[
              { label: t('Credentials'), to: RouteObj.EdaCredentials },
              { label: t('Edit credential') },
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
          title={t('Create credential')}
          breadcrumbs={[
            { label: t('Credentials'), to: RouteObj.EdaCredentials },
            { label: t('Create credential') },
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
