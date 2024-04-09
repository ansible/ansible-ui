import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  LoadingPage,
  PageFormCheckbox,
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
import { useGet } from '../../../common/crud/useGet';
import { usePatchRequest } from '../../../common/crud/usePatchRequest';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { AwxItemsResponse } from '../../common/AwxItemsResponse';
import { AwxPageForm } from '../../common/AwxPageForm';
import { awxAPI } from '../../common/api/awx-utils';
import { useAwxActiveUser } from '../../common/useAwxActiveUser';
import { Credential } from '../../interfaces/Credential';
import { CredentialType } from '../../interfaces/CredentialType';
import { AwxRoute } from '../../main/AwxRoutes';
import { PageFormSelectOrganization } from '../organizations/components/PageFormOrganizationSelect';

interface CredentialForm extends Credential {
  user?: number;
}

export function CreateCredential() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const navigate = useNavigate();
  const { activeAwxUser } = useAwxActiveUser();
  const postRequest = usePostRequest<Credential>();
  const getPageUrl = useGetPageUrl();

  const { data: itemsResponse, isLoading } = useGet<AwxItemsResponse<CredentialType>>(
    awxAPI`/credential_types/?page=1&page_size=200`
  );

  if (isLoading && !itemsResponse) {
    return <LoadingPage />;
  }

  const credentialTypes: CredentialTypes | undefined = itemsResponse?.results?.reduce(
    (credentialTypesMap, credentialType) => {
      credentialTypesMap[credentialType.id] = credentialType;
      return credentialTypesMap;
    },
    {} as CredentialTypes
  );

  const onSubmit: PageFormSubmitHandler<CredentialForm> = async (credential) => {
    const credentialTypeInputs = credentialTypes?.[credential?.credential_type]?.inputs;

    const pluginInputs: Record<string, string | number> = {};
    const possibleFields = credentialTypeInputs?.fields || [];
    possibleFields.forEach((field) => {
      if (field.id && typeof field.id === 'string' && field.id in credential) {
        const id = field.id as keyof CredentialForm;
        if (credential[id] !== undefined) {
          pluginInputs[id] = credential[id] as string | number;
          delete credential[id];
        }
      }
    });

    // can send only one of org, user, team
    if (!credential.organization) {
      credential.user = activeAwxUser?.id;
    }
    const newCredential = await postRequest(awxAPI`/credentials/`, {
      ...credential,
      inputs: { ...pluginInputs },
    });
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
  const { activeAwxUser } = useAwxActiveUser();
  const getPageUrl = useGetPageUrl();
  const patch = usePatchRequest();
  const { data: credential, isLoading } = useGet<Credential>(
    awxAPI`/credentials/${id.toString()}/`
  );

  if (isLoading && !credential) {
    return <LoadingPage />;
  }

  const onSubmit: PageFormSubmitHandler<CredentialForm> = async (editedCredential) => {
    // can send only one of org, user, team
    if (!editedCredential.organization) {
      editedCredential.user = activeAwxUser?.id;
    }
    await patch(awxAPI`/credentials/${id.toString()}/`, editedCredential);
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

type CredentialTypes = {
  [key: number]: CredentialType;
};

function CredentialInputs() {
  const { t } = useTranslation();
  const { data: itemsResponse, isLoading } = useGet<AwxItemsResponse<CredentialType>>(
    awxAPI`/credential_types/?page=1&page_size=200`
  );

  const selectedCredentialTypeId = useWatch<{ credential_type: number }>({
    name: 'credential_type',
  });

  if (isLoading && !itemsResponse) {
    return <LoadingPage />;
  }

  const credentialTypes: CredentialTypes | undefined = itemsResponse?.results?.reduce(
    (credentialTypesMap, credentialType) => {
      credentialTypesMap[credentialType.id] = credentialType;
      return credentialTypesMap;
    },
    {} as CredentialTypes
  );

  const isGalaxyCredential =
    !!selectedCredentialTypeId && credentialTypes?.[selectedCredentialTypeId]?.kind === 'galaxy';

  return (
    <>
      <PageFormTextInput<Credential>
        name="name"
        label={t('Name')}
        placeholder={t('Enter name')}
        isRequired
      />
      <>
        <PageFormSelect<Credential>
          label={t('Credential type')}
          placeholderText={t('Select credential type')}
          name="credential_type"
          options={
            itemsResponse?.results
              .sort((l, r) => compareStrings(l.name, r.name))
              .map((credentialType) => ({
                label: credentialType.name,
                value: credentialType.id,
              })) ?? []
          }
          isRequired
        />
      </>
      <PageFormSelectOrganization<Credential> isRequired={isGalaxyCredential} name="organization" />
      <PageFormSection singleColumn>
        <PageFormTextArea<Credential>
          name="description"
          label={t('Description')}
          placeholder={t('Enter description')}
        />
      </PageFormSection>
      {selectedCredentialTypeId && credentialTypes && credentialTypes[selectedCredentialTypeId] ? (
        <CredentialSubForm credentialType={credentialTypes[selectedCredentialTypeId]} />
      ) : null}
    </>
  );
}

function CredentialSubForm({ credentialType }: { credentialType: CredentialType | undefined }) {
  const { t } = useTranslation();
  if (!credentialType) {
    return null;
  }

  const stringFields = credentialType?.inputs?.fields.filter(
    (field) => field.type === 'string' && !field?.choices?.length
  );
  const choiceFields = credentialType?.inputs?.fields.filter(
    (field) => (field?.choices?.length ?? 0) > 0
  );
  const booleanFields = credentialType?.inputs?.fields.filter((field) => field.type === 'boolean');
  const requiredFields = credentialType?.inputs?.required || [];

  return (
    <PageFormSection title={t('Type Details')}>
      {stringFields.length > 0 &&
        stringFields.map((field) => {
          if (field?.multiline) {
            return (
              <PageFormTextArea<CredentialType>
                key={field.id}
                name={field.id as keyof CredentialType}
                label={field.label}
                placeholder={field?.default ? String(field?.default) : ''}
                isRequired={requiredFields.includes(field.id)}
                labelHelp={field.help_text}
              />
            );
          } else {
            return (
              <PageFormTextInput<CredentialType>
                key={field.id}
                name={field.id as keyof CredentialType}
                label={field.label}
                type={field.secret ? 'password' : 'text'}
                placeholder={field.default ? String(field.default) : ''}
                isRequired={requiredFields.includes(field.id)}
                labelHelp={field.help_text}
              />
            );
          }
        })}
      {choiceFields.length > 0 &&
        choiceFields.map((field) => (
          <PageFormSelect<CredentialType>
            key={field.id}
            placeholderText={String(field?.default)}
            name={field.id as keyof CredentialType}
            label={field.label}
            options={field?.choices?.map((choice) => ({ value: choice, label: choice })) ?? []}
            isRequired={requiredFields.includes(field.id)}
            labelHelp={field.help_text}
          />
        ))}
      {booleanFields.length > 0 &&
        booleanFields.map((field) => (
          <PageFormCheckbox<CredentialType>
            key={field.id}
            name={field.id as keyof CredentialType}
            label={field.label}
            isRequired={requiredFields.includes(field.id)}
            labelHelp={field.help_text}
          />
        ))}
    </PageFormSection>
  );
}
