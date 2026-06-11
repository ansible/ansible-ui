import {
  PageFormDataEditor,
  PageFormTextArea,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { PageFormTextInput } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormTextInput';
import { PageFormSubmitHandler } from '@ansible/ansible-ui-framework/PageForm/PageForm';
import { PageFormSection } from '@ansible/ansible-ui-framework/PageForm/Utils/PageFormSection';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { useOptions } from '@ansible/common-ui/crud/useOptions';
import { usePatchRequest } from '@ansible/common-ui/crud/usePatchRequest';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { Alert, Button } from '@patternfly/react-core';
import { useCallback } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { edaAPI } from '../../common/eda-utils';
import { EdaPageForm } from '../../common/EdaPageForm';
import {
  EdaCredentialType,
  EdaCredentialTypeCreate,
  EdaCredentialTypeInputs,
} from '../../interfaces/EdaCredentialType';
import { ActionsResponse, OptionsResponse } from '../../interfaces/OptionsResponse';
import { EdaRoute } from '../../main/EdaRoutes';
import { CredentialTypeDetails } from './CredentialTypePage/CredentialTypeDetails';

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
        title={t('Create credential type')}
        breadcrumbs={[
          { label: t('Credential Types'), to: getPageUrl(EdaRoute.CredentialTypes) },
          { label: t('Create credential type') },
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
  const { data } = useOptions<OptionsResponse<ActionsResponse>>(
    edaAPI`/credential-types/${params.id ?? ''}/`
  );
  const canPatchCredentialType = data ? Boolean(data.actions && data.actions['PATCH']) : true;

  const { data: credentialType } = useGet<EdaCredentialType>(
    edaAPI`/credential-types/` + `${params?.id}/`
  );

  const patchRequest = usePatchRequest<EdaCredentialType, EdaCredentialType>();

  const handleSubmit: PageFormSubmitHandler<EdaCredentialType> = async (editedCredentialType) => {
    await patchRequest(edaAPI`/credential-types/` + `${params?.id}/`, editedCredentialType);
    pageNavigate(EdaRoute.CredentialTypeDetails, { params: { id: params?.id } });
  };

  const hasCredentialType = !!credentialType;
  const onCancel = () => void navigate(-1);
  return (
    <PageLayout>
      <PageHeader
        title={credentialType?.name ? `${t('Edit')} ${credentialType?.name}` : t('Credential Type')}
        breadcrumbs={[
          { label: t('Credential Types'), to: getPageUrl(EdaRoute.CredentialTypes) },
          {
            label: credentialType?.name
              ? `${t('Edit')} ${credentialType?.name}`
              : t('Credential Type'),
          },
        ]}
      />
      {hasCredentialType &&
        (!canPatchCredentialType ? (
          <>
            <Alert
              variant={'warning'}
              isInline
              style={{
                marginLeft: '24px',
                marginRight: '24px',
                marginTop: '24px',
                paddingLeft: '24px',
                paddingTop: '16px',
              }}
              title={t(
                'You do not have permissions to edit this credential type. Please contact your organization administrator if there is an issue with your access.'
              )}
            />
            <CredentialTypeDetails />
          </>
        ) : (
          <EdaPageForm<EdaCredentialType>
            submitText={t('Save credential type')}
            onSubmit={handleSubmit}
            onCancel={onCancel}
            defaultValue={getInitialFormValues(credentialType)}
          >
            <CredentialTypeInputs />
          </EdaPageForm>
        ))}
    </PageLayout>
  );
}

function CredentialTypeInputs() {
  const { t } = useTranslation();
  const { setValue } = useFormContext();

  const credentialInputs = useWatch<EdaCredentialTypeCreate>({
    name: 'inputs',
    defaultValue: undefined,
  }) as EdaCredentialTypeInputs;

  const credentialInjectors = useWatch<EdaCredentialTypeCreate>({
    name: 'injectors',
    defaultValue: undefined,
  }) as Record<string, unknown>;

  const setInjectorsExtraVars = useCallback(() => {
    const fields = credentialInputs?.fields;
    let extraVarFields = '';
    fields?.map((field, idx) => {
      if (idx > 0) {
        extraVarFields += ',';
      }
      extraVarFields += `"${field.id}" : "{{${field.id}}}"`;
    });
    const extraVars = `{ ${extraVarFields}}`;
    setValue(
      'injectors',
      JSON.parse(
        JSON.stringify({ ...credentialInjectors, extra_vars: JSON.parse(extraVars) as unknown })
      ),
      { shouldValidate: true }
    );
  }, [credentialInjectors, credentialInputs?.fields, setValue]);

  const clearInjectorsExtraVars = useCallback(() => {
    const injectorsWithoutExtraVars = credentialInjectors;
    if (injectorsWithoutExtraVars?.extra_vars) {
      delete injectorsWithoutExtraVars.extra_vars;
    }
    setValue('injectors', injectorsWithoutExtraVars);
  }, [credentialInjectors, setValue]);

  return (
    <>
      <PageFormTextInput<EdaCredentialType>
        name="name"
        label={t('Name')}
        placeholder={t('Enter credential type name')}
        isRequired
      />
      <PageFormTextArea<EdaCredentialType>
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
            `Input schema which defines a set of ordered fields for that type, either in JSON or YAML syntax. Refer to the Ansible Controller documentation for example syntax.`
          )}
          format="object"
        />
      </PageFormSection>
      {credentialInputs &&
        Object.keys(credentialInputs).length !== 0 &&
        credentialInputs.fields &&
        credentialInputs.fields.length > 0 && (
          <PageFormSection>
            <Button
              id={'generate-injector'}
              variant={'secondary'}
              size={'sm'}
              style={{ maxWidth: 150 }}
              onClick={() => setInjectorsExtraVars()}
            >
              {t('Generate extra vars')}
            </Button>
          </PageFormSection>
        )}
      <PageFormSection singleColumn>
        <PageFormDataEditor
          name="injectors"
          label={t('Injector configuration')}
          labelHelpTitle={t('Injector configuration')}
          labelHelp={t(
            `Enter injectors using either JSON or YAML syntax. Refer to the Ansible Controller documentation for example syntax.`
          )}
          format="object"
        />
        {credentialInjectors && Object.keys(credentialInjectors).length !== 0 && (
          <PageFormSection>
            <Button
              id={'generate-injector'}
              variant={'secondary'}
              size={'sm'}
              style={{ maxWidth: 150 }}
              onClick={() => clearInjectorsExtraVars()}
            >
              {t('Clear extra vars')}
            </Button>
          </PageFormSection>
        )}
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
