import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  compareStrings,
  PageFormSelectOption,
  PageHeader,
  PageLayout,
} from '../../../../framework';
import { PageFormTextArea } from '../../../../framework/PageForm/Inputs/PageFormTextArea';
import { PageFormTextInput } from '../../../../framework/PageForm/Inputs/PageFormTextInput';
import { PageForm, PageFormSubmitHandler } from '../../../../framework/PageForm/PageForm';
import { PageFormSection } from '../../../../framework/PageForm/Utils/PageFormSection';
import { ItemsResponse, requestPatch } from '../../../common/crud/Data';
import { useGet } from '../../../common/crud/useGet';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { useActiveUser } from '../../../common/useActiveUser';
import { RouteObj } from '../../../Routes';
import { PageFormOrganizationSelect } from '../../access/organizations/components/PageFormOrganizationSelect';
import { getOrganizationByName } from '../../access/organizations/utils/getOrganizationByName';
import { Credential } from '../../interfaces/Credential';
import { CredentialType } from '../../interfaces/CredentialType';
import { getAwxError } from '../../useAwxView';

interface CredentialForm extends Credential {
  user?: number;
}

export function CreateCredential() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const activeUser = useActiveUser();
  const postRequest = usePostRequest<Credential>();
  const onSubmit: PageFormSubmitHandler<CredentialForm> = async (credential, setError) => {
    try {
      if (credential.summary_fields.organization?.name) {
        try {
          const organization = await getOrganizationByName(
            credential.summary_fields.organization.name
          );
          if (!organization) throw new Error(t('Organization not found.'));
          credential.organization = organization.id;
        } catch {
          throw new Error(t('Organization not found.'));
        }
      } else {
        credential.user = activeUser?.id;
      }
      const newCredential = await postRequest('/api/v2/credentials/', credential);
      navigate(RouteObj.CredentialDetails.replace(':id', newCredential.id.toString()));
    } catch (err) {
      setError(await getAwxError(err));
    }
  };
  return (
    <PageLayout>
      <PageHeader
        title={t('Create Credential')}
        breadcrumbs={[
          { label: t('Credentials'), to: RouteObj.Credentials },
          { label: t('Create Credential') },
        ]}
      />
      <PageForm
        submitText={t('Create credential')}
        onSubmit={onSubmit}
        onCancel={() => navigate(-1)}
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
  const { data: credential } = useGet<Credential>(`/api/v2/credentials/${id.toString()}/`);
  const activeUser = useActiveUser();

  const onSubmit: PageFormSubmitHandler<CredentialForm> = async (editedCredential, setError) => {
    try {
      if (editedCredential.summary_fields.organization?.name) {
        try {
          const organization = await getOrganizationByName(
            editedCredential.summary_fields.organization.name
          );
          if (!organization) throw new Error(t('Organization not found.'));
          editedCredential.organization = organization.id;
        } catch {
          throw new Error(t('Organization not found.'));
        }
      } else {
        editedCredential.user = activeUser?.id;
      }
      await requestPatch<Credential>(`/api/v2/credentials/${id}/`, editedCredential);
      navigate(-1);
    } catch (err) {
      setError(await getAwxError(err));
    }
  };
  if (!credential) {
    return (
      <PageLayout>
        <PageHeader
          breadcrumbs={[
            { label: t('Credentials'), to: RouteObj.Credentials },
            { label: t('Edit Credential') },
          ]}
        />
      </PageLayout>
    );
  }
  return (
    <PageLayout>
      <PageHeader
        title={t('Edit Credential')}
        breadcrumbs={[
          { label: t('Credentials'), to: RouteObj.Credentials },
          { label: t('Edit Credential') },
        ]}
      />
      <PageForm
        submitText={t('Save credential')}
        onSubmit={onSubmit}
        onCancel={() => navigate(-1)}
        defaultValue={credential}
      >
        <CredentialInputs />
      </PageForm>
    </PageLayout>
  );
}

function CredentialInputs() {
  const { t } = useTranslation();
  const itemsResponse = useGet<ItemsResponse<CredentialType>>(
    '/api/v2/credential_types/?page=1&page_size=200'
  );
  return (
    <>
      <PageFormTextInput<Credential>
        name="name"
        label={t('Name')}
        placeholder={t('Enter name')}
        isRequired
      />
      <PageFormSelectOption<Credential>
        label={t('Credential type')}
        placeholderText={t('Select credential type')}
        name="credential_type"
        options={
          itemsResponse.data?.results
            .sort((l, r) => compareStrings(l.name, r.name))
            .map((credentialType) => ({
              label: credentialType.name,
              value: credentialType.id,
            })) ?? []
        }
        isRequired
      />
      <PageFormOrganizationSelect<Credential> name="summary_fields.organization.name" />
      <PageFormSection singleColumn>
        <PageFormTextArea<Credential>
          name="description"
          label={t('Description')}
          placeholder={t('Enter description')}
        />
      </PageFormSection>
    </>
  );
}
