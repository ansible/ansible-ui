import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  PageFormDataEditor,
  PageFormTextArea,
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
import {
  EdaCredentialType,
  EdaCredentialTypeCreate,
  EdaCredentialTypeInputs,
} from '../../interfaces/EdaCredentialType';
import { EdaPageForm } from '../../common/EdaPageForm';
import { Alert, Button } from '@patternfly/react-core';
import { useFormContext, useWatch } from 'react-hook-form';
import { useCallback, useState } from 'react';
import { PageFormSelectOrganization } from '../organizations/components/PageFormOrganizationSelect';
import { CredentialTypeDetails } from './CredentialTypePage/CredentialTypeDetails';
import { useOptions } from '../../../common/crud/useOptions';
import { ActionsResponse, OptionsResponse } from '../../interfaces/OptionsResponse';

export function CreateCredentialType() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const pageNavigate = usePageNavigate();

  const postRequest = usePostRequest<EdaCredentialType, EdaCredentialType>();

  const onSubmit: PageFormSubmitHandler<IEdaCredentialType> = async (credentialType) => {
    const credentialTypeInput =
      !credentialType.injectors && credentialType.injectors_g
        ? { ...credentialType, injectors: JSON.parse(credentialType.injectors_g) as never }
        : credentialType;
    const newCredentialType = await postRequest(edaAPI`/credential-types/`, credentialTypeInput);
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

  const handleSubmit: PageFormSubmitHandler<IEdaCredentialType> = async (editedCredentialType) => {
    const editedCredentialTypeInput =
      !editedCredentialType.injectors && editedCredentialType.injectors_g
        ? {
            ...editedCredentialType,
            injectors: JSON.parse(editedCredentialType.injectors_g) as never,
          }
        : editedCredentialType;
    await patchRequest(edaAPI`/credential-types/` + `${params?.id}/`, editedCredentialTypeInput);
    pageNavigate(EdaRoute.CredentialTypeDetails, { params: { id: params?.id } });
  };

  const hasCredentialType = !!credentialType;
  const onCancel = () => navigate(-1);
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
  const [injectorGenerated, setInjectorGenerated] = useState<boolean>(false);

  const credentialInputs = useWatch<EdaCredentialTypeCreate>({
    name: 'inputs',
    defaultValue: undefined,
  }) as EdaCredentialTypeInputs;

  const setInjectorsExtraVars = useCallback(() => {
    const fields = Array.isArray(credentialInputs?.fields) ? credentialInputs?.fields : [];
    let extraVarFields = '';
    fields?.map((field, idx) => {
      if (idx > 0) {
        extraVarFields += ',';
      }
      extraVarFields += `"${field.id}" : "{{${field.id}}}"`;
    });
    const extraVars = `{"extra_vars": { ${extraVarFields}}}`;
    setValue('injectors_g', extraVars);
    setValue('injectors', undefined);
    setInjectorGenerated(true);
  }, [credentialInputs, setValue]);

  const clearInjectorsExtraVars = useCallback(() => {
    setValue('injectors_g', undefined);
    setInjectorGenerated(false);
  }, [setValue]);

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
      <PageFormSelectOrganization<EdaCredentialTypeCreate> name="organization_id" />
      <PageFormSection singleColumn>
        <PageFormDataEditor
          name="inputs"
          label={t('Input configuration')}
          labelHelpTitle={t('Input configuration')}
          labelHelp={t(
            `Enter inputs using either JSON or YAML syntax. Refer to the Ansible Controller documentation for example syntax.`
          )}
          isRequired
          format="object"
        />
      </PageFormSection>
      {credentialInputs && Object.keys(credentialInputs).length !== 0 && (
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
      {!injectorGenerated && (
        <PageFormSection singleColumn>
          <PageFormDataEditor
            name="injectors"
            label={t('Injector configuration')}
            labelHelpTitle={t('Injector configuration')}
            labelHelp={t(
              `Enter injectors using either JSON or YAML syntax. Refer to the Ansible Controller documentation for example syntax.`
            )}
            isRequired
            format="object"
          />
        </PageFormSection>
      )}
      {injectorGenerated && (
        <PageFormSection singleColumn>
          <PageFormTextArea
            name="injectors_g"
            label={t('Injector configuration')}
            labelHelpTitle={t('Injector configuration')}
            labelHelp={t(
              `Enter injectors using either JSON or YAML syntax. Refer to the Ansible Controller documentation for example syntax.`
            )}
            isReadOnly
            isRequired
          />
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
        </PageFormSection>
      )}
    </>
  );
}

function getInitialFormValues(credentialType?: EdaCredentialType) {
  if (!credentialType) {
    return { name: '', description: '', inputs: {}, injectors: {} };
  }
  return credentialType;
}

type IEdaCredentialType = EdaCredentialType & {
  injectors_g?: string;
};
