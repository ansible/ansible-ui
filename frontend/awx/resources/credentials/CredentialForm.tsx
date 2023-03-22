import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import useSWR from 'swr';
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
import { useActiveUser } from '../../../common/useActiveUser';
import { useGet } from '../../../common/useItem';
import { ItemsResponse, requestGet, requestPatch, requestPost, swrOptions } from '../../../Data';
import { RouteObj } from '../../../Routes';
import { PageFormOrganizationSelect } from '../../access/organizations/components/PageFormOrganizationSelect';
import { Credential } from '../../interfaces/Credential';
import { CredentialType } from '../../interfaces/CredentialType';
import { Organization } from '../../interfaces/Organization';
import { getAwxError } from '../../useAwxView';

export function CreateCredential() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const activeUser = useActiveUser();
  const onSubmit: PageFormSubmitHandler<Credential> = async (credential, setError) => {
    try {
      if (credential.summary_fields.organization.name) {
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
      const newCredential = await requestPost<Credential>('/api/v2/credentials/', credential);
      navigate(RouteObj.CredentialDetails.replace(':id', newCredential.id.toString()));
    } catch (err) {
      setError(await getAwxError(err));
    }
  };
  return (
    <PageLayout>
      <PageHeader
        title={t('Create credential')}
        breadcrumbs={[
          { label: t('Credentials'), to: RouteObj.Credentials },
          { label: t('Create credential') },
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

async function getOrganizationByName(organizationName: string) {
  const itemsResponse = await requestGet<ItemsResponse<Organization>>(
    `/api/v2/organizations/?name=${organizationName}`
  );
  if (itemsResponse.results.length >= 1) {
    return itemsResponse.results[0];
  }
  return undefined;
}

export function EditCredential() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const { data: credential } = useSWR<Credential>(
    `/api/v2/credentials/${id.toString()}/`,
    requestGet,
    swrOptions
  );
  const activeUser = useActiveUser();
  const onSubmit: PageFormSubmitHandler<Credential> = async (editedCredential, setError) => {
    try {
      if (editedCredential.summary_fields.organization.name) {
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
            { label: t('Edit credential') },
          ]}
        />
      </PageLayout>
    );
  }
  return (
    <PageLayout>
      <PageHeader
        title={t('Edit credential')}
        breadcrumbs={[
          { label: t('Credentials'), to: RouteObj.Credentials },
          { label: t('Edit credential') },
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
