import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
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
import { jsonToYaml, parseVariableField } from '../../../../framework/utils/codeEditorUtils';
import { useGet } from '../../../common/crud/useGet';
import { usePatchRequest } from '../../../common/crud/usePatchRequest';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { AwxPageForm } from '../../common/AwxPageForm';
import { awxAPI } from '../../common/api/awx-utils';
import type { CredentialType } from '../../interfaces/CredentialType';
import { AwxRoute } from '../../main/AwxRoutes';

export interface CredentialTypeForm {
  name: string;
  description: string;
  id?: number;
  kind: string;
  inputs: string | object;
  injectors: string | object;
}
export function CreateCredentialType() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const pageNavigate = usePageNavigate();

  const postRequest = usePostRequest<CredentialTypeForm, CredentialType>();

  const handleSubmit: PageFormSubmitHandler<CredentialTypeForm> = async (credentialType) => {
    const createdCredentialType = await postRequest(awxAPI`/credential_types/`, {
      ...credentialType,
      kind: 'cloud',
      inputs: parseVariableField(credentialType.inputs as string),
      injectors: parseVariableField(credentialType.injectors as string),
    });
    pageNavigate(AwxRoute.CredentialTypeDetails, {
      params: { id: createdCredentialType.id.toString() },
    });
  };

  return (
    <PageLayout>
      <PageHeader
        title={t('Create Credential Type')}
        breadcrumbs={[
          { label: t('Credential Types'), to: getPageUrl(AwxRoute.CredentialTypes) },
          { label: t('Create Credential Type') },
        ]}
      />
      <AwxPageForm<CredentialTypeForm>
        submitText={t('Create credential type')}
        onSubmit={handleSubmit}
        onCancel={() => pageNavigate(AwxRoute.CredentialTypes)}
        defaultValue={getInitialFormValues()}
      >
        <CredentialTypeInputs />
      </AwxPageForm>
    </PageLayout>
  );
}

export function EditCredentialType() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const pageNavigate = usePageNavigate();

  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const { data: credentialType } = useGet<CredentialType>(
    awxAPI`/credential_types/${id.toString()}/`
  );

  const patchRequest = usePatchRequest<CredentialTypeForm, CredentialType>();

  const handleSubmit: PageFormSubmitHandler<CredentialTypeForm> = async (editedCredentialType) => {
    editedCredentialType.inputs = parseVariableField(editedCredentialType.inputs as string);
    editedCredentialType.injectors = parseVariableField(editedCredentialType.injectors as string);
    await patchRequest(awxAPI`/credential_types/${id.toString()}/`, editedCredentialType);
    pageNavigate(AwxRoute.CredentialTypeDetails, { params: { id: id.toString() } });
  };

  const hasCredentialType = !!credentialType;

  return (
    <PageLayout>
      <PageHeader
        title={t('Edit Credential Type')}
        breadcrumbs={[
          { label: t('Credential Types'), to: getPageUrl(AwxRoute.CredentialTypes) },
          { label: t('Edit Credential Type') },
        ]}
      />
      {hasCredentialType && (
        <AwxPageForm<CredentialTypeForm>
          submitText={t('Save credential type')}
          onSubmit={handleSubmit}
          onCancel={() => pageNavigate(AwxRoute.CredentialTypeDetails, { params: { id } })}
          defaultValue={getInitialFormValues(credentialType)}
        >
          <CredentialTypeInputs />
        </AwxPageForm>
      )}
    </PageLayout>
  );
}

function CredentialTypeInputs() {
  const { t } = useTranslation();
  return (
    <>
      <PageFormTextInput<CredentialType>
        name="name"
        label={t('Name')}
        placeholder={t('Enter name')}
        isRequired
      />
      <PageFormTextInput<CredentialType>
        name="description"
        label={t('Description')}
        placeholder={t('Enter description')}
      />
      <PageFormSection singleColumn>
        <PageFormDataEditor
          labelHelpTitle={t('Input configuration')}
          labelHelp={t(
            `Enter inputs using either JSON or YAML syntax. Refer to the Ansible Controller documentation for example syntax.`
          )}
          toggleLanguages={['yaml', 'json']}
          label={t('Input configuration')}
          name="inputs"
          allowUpload={false}
          allowDownload={false}
          defaultExpanded={true}
        />
        <PageFormDataEditor
          labelHelpTitle={t('Injector configuration')}
          labelHelp={t(
            `Enter injectors using either JSON or YAML syntax. Refer to the Ansible Controller documentation for example syntax.`
          )}
          toggleLanguages={['yaml', 'json']}
          label={t('Injector configuration')}
          name="injectors"
          allowUpload={false}
          allowDownload={false}
          defaultExpanded={true}
        />
      </PageFormSection>
    </>
  );
}

function getInitialFormValues(credentialType?: CredentialType) {
  if (!credentialType) {
    return {
      name: '',
      description: '',
      inputs: '---',
      injectors: '---',
    };
  }

  const { name = '', description = '', inputs, injectors } = credentialType;
  const inputsValue = inputs ? jsonToYaml(JSON.stringify(inputs)) : '---';
  const injectorsValue = injectors ? jsonToYaml(JSON.stringify(injectors)) : '---';

  return {
    name,
    description,
    inputs: inputsValue,
    injectors: injectorsValue,
  };
}
