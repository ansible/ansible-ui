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
import { useGet } from '../../../common/crud/useGet';
import { usePatchRequest } from '../../../common/crud/usePatchRequest';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { AwxPageForm } from '../../common/AwxPageForm';
import { awxAPI } from '../../common/api/awx-utils';
import { CredentialType } from '../../interfaces/CredentialType';
import { AwxRoute } from '../../main/AwxRoutes';

export function CreateCredentialType() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const pageNavigate = usePageNavigate();

  const postRequest = usePostRequest<CredentialType, CredentialType>();

  const handleSubmit: PageFormSubmitHandler<CredentialType> = async (credentialType) => {
    const createdCredentialType = await postRequest(awxAPI`/credential_types/`, {
      ...credentialType,
      kind: 'cloud',
    });
    pageNavigate(AwxRoute.CredentialTypeDetails, {
      params: { id: createdCredentialType.id.toString() },
    });
  };

  return (
    <PageLayout>
      <PageHeader
        title={t('Create credential type')}
        breadcrumbs={[
          { label: t('Credential Types'), to: getPageUrl(AwxRoute.CredentialTypes) },
          { label: t('Create credential type') },
        ]}
      />
      <AwxPageForm<CredentialType>
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

  const patchRequest = usePatchRequest<CredentialType, CredentialType>();

  const handleSubmit: PageFormSubmitHandler<CredentialType> = async (editedCredentialType) => {
    await patchRequest(awxAPI`/credential_types/${id.toString()}/`, editedCredentialType);
    pageNavigate(AwxRoute.CredentialTypeDetails, { params: { id: id.toString() } });
  };

  const hasCredentialType = !!credentialType;

  return (
    <PageLayout>
      <PageHeader
        title={
          credentialType?.name
            ? t('Edit {{credentialtypeName}}', { credentialtypeName: credentialType?.name })
            : t('Credential Types')
        }
        breadcrumbs={[
          { label: t('Credential Types'), to: getPageUrl(AwxRoute.CredentialTypes) },
          {
            label: credentialType?.name
              ? t('Edit {{credentialtypeName}}', { credentialtypeName: credentialType?.name })
              : t('Credential Types'),
          },
        ]}
      />
      {hasCredentialType && (
        <AwxPageForm<CredentialType>
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

function getInitialFormValues(credentialType?: CredentialType) {
  if (!credentialType) {
    return { name: '', description: '', inputs: {}, injectors: {} };
  }
  return credentialType;
}
