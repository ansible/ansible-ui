import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  PageFormSelect,
  PageHeader,
  PageLayout,
  compareStrings,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../framework';
import { PageFormTextArea } from '../../../../framework/PageForm/Inputs/PageFormTextArea';
import { PageFormTextInput } from '../../../../framework/PageForm/Inputs/PageFormTextInput';
import { PageFormSubmitHandler } from '../../../../framework/PageForm/PageForm';
import { PageFormSection } from '../../../../framework/PageForm/Utils/PageFormSection';
import { requestPatch } from '../../../common/crud/Data';
import { useGet } from '../../../common/crud/useGet';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { AwxItemsResponse } from '../../common/AwxItemsResponse';
import { AwxPageForm } from '../../common/AwxPageForm';
import { awxAPI } from '../../common/api/awx-utils';
import { useAwxActiveUser } from '../../common/useAwxActiveUser';
import { Credential } from '../../interfaces/Credential';
import { CredentialType } from '../../interfaces/CredentialType';
import { AwxRoute } from '../../main/AwxRoutes';
import { PageFormOrganizationSelect } from '../organizations/components/PageFormOrganizationSelect';
import { getOrganizationByName } from '../organizations/utils/getOrganizationByName';

interface CredentialForm extends Credential {
  user?: number;
}

export function CreateCredential() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const navigate = useNavigate();
  const activeUser = useAwxActiveUser();
  const postRequest = usePostRequest<Credential>();
  const getPageUrl = useGetPageUrl();
  const onSubmit: PageFormSubmitHandler<CredentialForm> = async (credential) => {
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
    const newCredential = await postRequest(awxAPI`/credentials/`, credential);
    pageNavigate(AwxRoute.CredentialDetails, { params: { id: newCredential.id } });
  };
  return (
    <PageLayout>
      <PageHeader
        title={t('Create Credential')}
        breadcrumbs={[
          { label: t('Credentials'), to: getPageUrl(AwxRoute.Credentials) },
          { label: t('Create Credential') },
        ]}
      />
      <AwxPageForm
        submitText={t('Create credential')}
        onSubmit={onSubmit}
        onCancel={() => navigate(-1)}
      >
        <CredentialInputs />
      </AwxPageForm>
    </PageLayout>
  );
}

export function EditCredential() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const { data: credential } = useGet<Credential>(awxAPI`/credentials/${id.toString()}/`);
  const activeUser = useAwxActiveUser();
  const getPageUrl = useGetPageUrl();

  const onSubmit: PageFormSubmitHandler<CredentialForm> = async (editedCredential) => {
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
    await requestPatch<Credential>(awxAPI`/credentials/${id.toString()}/`, editedCredential);
    navigate(-1);
  };
  if (!credential) {
    return (
      <PageLayout>
        <PageHeader
          breadcrumbs={[
            { label: t('Credentials'), to: getPageUrl(AwxRoute.Credentials) },
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
          { label: t('Credentials'), to: getPageUrl(AwxRoute.Credentials) },
          { label: t('Edit Credential') },
        ]}
      />
      <AwxPageForm
        submitText={t('Save credential')}
        onSubmit={onSubmit}
        onCancel={() => navigate(-1)}
        defaultValue={credential}
      >
        <CredentialInputs />
      </AwxPageForm>
    </PageLayout>
  );
}

function CredentialInputs() {
  const { t } = useTranslation();
  const itemsResponse = useGet<AwxItemsResponse<CredentialType>>(
    awxAPI`/credential_types/?page=1&page_size=200`
  );
  return (
    <>
      <PageFormTextInput<Credential>
        name="name"
        label={t('Name')}
        placeholder={t('Enter name')}
        isRequired
      />
      <PageFormSelect<Credential>
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
