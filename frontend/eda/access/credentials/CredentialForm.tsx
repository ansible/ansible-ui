import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import useSWR, { useSWRConfig } from 'swr';
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
import { EdaRoute } from '../../main/EdaRoutes';
import { EdaResult } from '../../interfaces/EdaResult';
import { EdaCredentialType, EdaCredentialTypeField } from '../../interfaces/EdaCredentialType';
import { useFormContext, useWatch } from 'react-hook-form';
import { CredentialFormInputs } from './CredentialFormTypes';
import { useCallback, useEffect } from 'react';
import { PageFormSelectOrganization } from '../organizations/components/PageFormOrganizationSelect';
import { EdaOrganization } from '../../interfaces/EdaOrganization';
import { requestGet, swrOptions } from '../../../common/crud/Data';
import { PageFormSection } from '../../../../framework/PageForm/Utils/PageFormSection';

// eslint-disable-next-line react/prop-types
function CredentialInputs(props: { editMode: boolean }) {
  const { t } = useTranslation();
  const { setValue } = useFormContext();
  const { data: credentialTypes } = useGet<EdaResult<EdaCredentialType>>(
    edaAPI`/credential-types/?page=1&page_size=200`
  );
  const credentialTypeId = Number(
    useWatch<EdaCredentialCreate>({
      name: 'credential_type_id',
      defaultValue: undefined,
    })
  );

  const credentialType =
    credentialTypeId !== undefined && credentialTypes?.results !== undefined
      ? credentialTypes.results.find((credentialtype) => credentialtype?.id === credentialTypeId)
      : undefined;

  const setDefaultValuesForType = useCallback(() => {
    const fields = credentialType?.inputs?.fields as EdaCredentialTypeField[];
    if (!credentialType) return;

    fields?.map((field) => {
      if (field?.default !== undefined) {
        setValue(`inputs.${field.id}`, field.default);
      } else if (field.type === 'boolean') {
        setValue(`inputs.${field.id}`, false);
      } else if (field.type === 'string') {
        setValue(`inputs.${field.id}`, '');
      }
    });
  }, [credentialType, setValue]);

  useEffect(() => {
    if (props.editMode || !credentialTypeId) return;
    setDefaultValuesForType();
  }, [setValue, props, credentialTypeId, setDefaultValuesForType]);

  return (
    <>
      <PageFormTextInput<EdaCredentialCreate>
        name="name"
        data-cy="name-form-field"
        label={t('Name')}
        placeholder={t('Enter name')}
        isRequired
        maxLength={150}
      />
      <PageFormTextInput<EdaCredentialCreate>
        name="description"
        data-cy="description-form-field"
        label={t('Description')}
        placeholder={t('Enter description ')}
        maxLength={150}
      />
      <PageFormSelectOrganization<EdaCredentialCreate> name="organization_id" />
      <PageFormSelect<EdaCredentialCreate>
        name="credential_type_id"
        data-cy="credential-type-form-field"
        label={t('Credential type')}
        isRequired
        isReadOnly={props.editMode}
        placeholderText={t('Select credential type')}
        options={
          credentialTypes?.results
            ? credentialTypes.results.map((item: { name: string; id: number }) => ({
                label: item.name,
                value: item.id,
              }))
            : []
        }
        labelHelpTitle={t('Credential type')}
      />
      {credentialType !== undefined && (
        <PageFormSection title={t('Type Details')}>
          <CredentialFormInputs credentialType={credentialType} />
        </PageFormSection>
      )}
    </>
  );
}

export function CreateCredential() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();

  const { cache } = useSWRConfig();
  const { data: organizations } = useSWR<EdaResult<EdaOrganization>>(
    edaAPI`/organizations/?name=Default`,
    requestGet,
    swrOptions
  );
  const defaultOrganization =
    organizations && organizations?.results && organizations.results.length > 0
      ? organizations.results[0]
      : undefined;

  const postRequest = usePostRequest<EdaCredentialCreate, EdaCredential>();

  const onSubmit: PageFormSubmitHandler<EdaCredentialCreate> = async (credential) => {
    const newCredential = await postRequest(edaAPI`/eda-credentials/`, credential);
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
        defaultValue={{ organization_id: defaultOrganization?.id }}
      >
        <CredentialInputs editMode={false} />
      </EdaPageForm>
    </PageLayout>
  );
}

export function EditCredential() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const { data: credential } = useGet<EdaCredential>(edaAPI`/eda-credentials/${id.toString()}/`);

  const { cache } = useSWRConfig();
  const patchRequest = usePatchRequest<EdaCredentialCreate, EdaCredential>();

  const onSubmit: PageFormSubmitHandler<EdaCredentialCreate> = async (credential) => {
    await patchRequest(edaAPI`/eda-credentials/${id.toString()}/`, credential);
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
          defaultValue={{
            ...credential,
            credential_type_id: credential?.credential_type?.id || undefined,
          }}
        >
          <CredentialInputs editMode={true} />
        </EdaPageForm>
      </PageLayout>
    );
  }
}
