import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  PageFormDataEditor,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../framework';
import { PageFormTextInput } from '../../../../framework/PageForm/Inputs/PageFormTextInput';
import { PageFormSubmitHandler } from '../../../../framework/PageForm/PageForm';
import { PageFormSection } from '../../../../framework/PageForm/Utils/PageFormSection';
import { useGet } from '../../../common/crud/useGet';
import { usePatchRequest } from '../../../common/crud/usePatchRequest';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { EdaRoute } from '../../main/EdaRoutes';
import { edaAPI } from '../../common/eda-utils';
import { EdaCredentialType } from '../../interfaces/EdaCredentialType';
import { EdaPageForm } from '../../common/EdaPageForm';

export function CreateCredentialType() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const pageNavigate = usePageNavigate();

  const postRequest = usePostRequest<EdaCredentialType, EdaCredentialType>();

  const onSubmit: PageFormSubmitHandler<EdaCredentialType> = async (credentialType) => {
    const newCredentialType = await postRequest(edaAPI`/credential-types/`, credentialType);
    pageNavigate(EdaRoute.CredentialTypePage, { params: { id: newCredentialType.id } });
  };

  return (
    <PageLayout>
      <PageHeader
        title={t('Create Credential Type')}
        breadcrumbs={[
          { label: t('Credential Types'), to: getPageUrl(EdaRoute.CredentialTypes) },
          { label: t('Create Credential Type') },
        ]}
      />
      <EdaPageForm<EdaCredentialType>
        submitText={t('Create credential type')}
        onSubmit={onSubmit}
        onCancel={() => pageNavigate(EdaRoute.CredentialTypes)}
        defaultValue={getInitialFormValues()}
      >
        <CredentialTypeInputs />
      </EdaPageForm>
    </PageLayout>
  );
}

export function EditCredentialType() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const pageNavigate = usePageNavigate();
  const navigate = useNavigate();

  const params = useParams<{ id?: string }>();
  const { data: credentialType } = useGet<EdaCredentialType>(
    edaAPI`/credential-types/` + `${params?.id}/`
  );

  const patchRequest = usePatchRequest<EdaCredentialType, EdaCredentialType>();

  const handleSubmit: PageFormSubmitHandler<EdaCredentialType> = async (editedCredentialType) => {
    await patchRequest(edaAPI`/credential-types/` + `${params?.id}/`, editedCredentialType);
    pageNavigate(EdaRoute.CredentialTypeDetails, { params: { id: params?.id } });
  };

  const hasCredentialType = !!credentialType;
  const onCancel = () => navigate(-1);
  return (
    <PageLayout>
      <PageHeader
        title={t('Edit Credential Type')}
        breadcrumbs={[
          { label: t('Credential Types'), to: getPageUrl(EdaRoute.CredentialTypes) },
          { label: t('Edit Credential Type') },
        ]}
      />
      {hasCredentialType && (
        <EdaPageForm<EdaCredentialType>
          submitText={t('Save credential type')}
          onSubmit={handleSubmit}
          onCancel={onCancel}
          defaultValue={getInitialFormValues(credentialType)}
        >
          <CredentialTypeInputs />
        </EdaPageForm>
      )}
    </PageLayout>
  );
}

function CredentialTypeInputs() {
  const { t } = useTranslation();
  return (
    <>
      <PageFormTextInput<EdaCredentialType>
        name="name"
        label={t('Name')}
        placeholder={t('Enter name')}
        isRequired
      />
      <PageFormTextInput<EdaCredentialType>
        name="description"
        label={t('Description')}
        placeholder={t('Enter description')}
      />
      <PageFormSection singleColumn>
        <PageFormDataEditor
          name="inputs"
          label={t('Input configuration')}
          labelHelpTitle={t('Input configuration')}
          labelHelp={t(
            `Enter inputs using either JSON or YAML syntax. Refer to the Ansible Controller documentation for example syntax.`
          )}
          format="object"
        />
        <PageFormDataEditor
          name="injectors"
          label={t('Injector configuration')}
          labelHelpTitle={t('Injector configuration')}
          labelHelp={t(
            `Enter injectors using either JSON or YAML syntax. Refer to the Ansible Controller documentation for example syntax.`
          )}
          format="object"
        />
      </PageFormSection>
    </>
  );
}

function getInitialFormValues(credentialType?: EdaCredentialType) {
  if (!credentialType) {
    return { name: '', description: '', inputs: {}, injectors: {} };
  }
  return credentialType;
}
