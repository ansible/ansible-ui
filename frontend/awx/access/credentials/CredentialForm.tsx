import { useCallback, useEffect, useState } from 'react';
import { useForm, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  LoadingPage,
  PageFormCheckbox,
  PageFormSelect,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../framework';
import { PageFormTextInput } from '../../../../framework/PageForm/Inputs/PageFormTextInput';
import { PageFormSubmitHandler } from '../../../../framework/PageForm/PageForm';
import { PageFormSection } from '../../../../framework/PageForm/Utils/PageFormSection';
import { useGet, useGetItem } from '../../../common/crud/useGet';
import { usePatchRequest } from '../../../common/crud/usePatchRequest';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { AwxPageForm } from '../../common/AwxPageForm';
import { awxAPI } from '../../common/api/awx-utils';
import { useAwxActiveUser } from '../../common/useAwxActiveUser';
import { useAwxGetAllPages } from '../../common/useAwxGetAllPages';
import { Credential } from '../../interfaces/Credential';
import { CredentialInputField, CredentialType } from '../../interfaces/CredentialType';
import { AwxRoute } from '../../main/AwxRoutes';
import { PageFormSelectOrganization } from '../organizations/components/PageFormOrganizationSelect';
import { CredentialMultilineInput } from './components/CredentialMultilineInput';
import { Button, Icon, InputGroup, InputGroupItem, Tooltip } from '@patternfly/react-core';
import { KeyIcon, RedoIcon } from '@patternfly/react-icons';
import { PageFormSelectCredentialType } from './components/PageFormSelectCredentialType';

interface SecretInput {
  onClear?: (name: string) => void;
  //shouldHideField?: (name: string) => boolean;
}
import {
  CredentialPluginsInputSource,
  useCredentialPluginsModal,
} from './CredentialPlugins/hooks/useCredentialPluginsDialog';
import { CredentialInputSource } from '../../interfaces/CredentialInputSource';
import { SecretManagementInputField } from './components/SecretManagementInputField';
import { BecomeMethodField } from './components/BecomeMethodField';

interface CredentialForm extends Credential {
  user?: number;
}

interface CredentialSelectProps extends CredentialInputField {
  name: string;
}

interface initialValues {
  name: string;
  description: string;
  credential_type: number;
  organization: number | null;
  [key: string]: string | number | null;
}

interface Prompts {
  [key: string]: boolean;
}

type CredentialTypes = {
  [key: number]: CredentialType;
};

export function CreateCredential() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const navigate = useNavigate();
  const { activeAwxUser } = useAwxActiveUser();
  const postRequest = usePostRequest<Credential | CredentialInputSource>();
  const getPageUrl = useGetPageUrl();
  const [credentialPluginValues, setCredentialPluginValues] = useState<
    CredentialPluginsInputSource[]
  >([]);
  const [accumulatedPluginValues, setaccumulatedPluginValues] = useState<
    CredentialPluginsInputSource[]
  >([]);
  useEffect(() => {
    setaccumulatedPluginValues((prev) => {
      // Filter out any values from prev that have input field names matching new values
      const filteredPrev = prev.filter(
        (prevValue) =>
          !credentialPluginValues.some(
            (newValue) => newValue.input_field_name === prevValue.input_field_name
          )
      );
      const updatedValues = [...filteredPrev, ...credentialPluginValues];

      return updatedValues;
    });
  }, [credentialPluginValues]);

  const { results: itemsResponse, isLoading } = useAwxGetAllPages<CredentialType>(
    awxAPI`/credential_types/`
  );

  if (isLoading && !itemsResponse) {
    return <LoadingPage />;
  }

  const parsedCredentialTypes: CredentialTypes | undefined = itemsResponse?.reduce(
    (credentialTypesMap, credentialType) => {
      credentialTypesMap[credentialType.id] = credentialType;
      return credentialTypesMap;
    },
    {} as CredentialTypes
  );

  const onSubmit: PageFormSubmitHandler<CredentialForm> = async (credential) => {
    const credentialTypeInputs = parsedCredentialTypes?.[credential?.credential_type]?.inputs;
    const pluginInputs: Record<string, string | number> = {};
    const isHandledByCredentialPlugin = (field: string) =>
      accumulatedPluginValues.some((cp) => cp.input_field_name === field);
    const possibleFields = credentialTypeInputs?.fields || [];
    possibleFields.forEach((field) => {
      if (
        field.id &&
        typeof field.id === 'string' &&
        field.id in credential &&
        !isHandledByCredentialPlugin(field.id)
      ) {
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
    const credentialInputSourcePayload = accumulatedPluginValues.map((credentialInputSource) => ({
      ...credentialInputSource,
      target_credential: newCredential.id,
    }));
    await Promise.all(
      credentialInputSourcePayload.map(async (credentialInputSource) => {
        await postRequest(
          awxAPI`/credential_input_sources/`,
          credentialInputSource as CredentialInputSource
        );
      })
    );
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
        <CredentialInputs
          isEditMode={false}
          credentialTypes={parsedCredentialTypes || {}}
          setCredentialPluginValues={setCredentialPluginValues}
          accumulatedPluginValues={accumulatedPluginValues}
          setAccumulatedPluginValues={setaccumulatedPluginValues}
        />
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
  const [_credentialPluginValues, setCredentialPluginValues] = useState<
    CredentialPluginsInputSource[]
  >([]);

  const { data: credential, isLoading: isLoadingCredential } = useGet<Credential>(
    awxAPI`/credentials/${id.toString()}/`
  );

  const { results: itemsResponse, isLoading: isLoadingCredentialType } =
    useAwxGetAllPages<CredentialType>(awxAPI`/credential_types/`);

  const parsedCredentialTypes: CredentialTypes | undefined = itemsResponse?.reduce(
    (credentialTypesMap, credentialType) => {
      credentialTypesMap[credentialType.id] = credentialType;
      return credentialTypesMap;
    },
    {} as CredentialTypes
  );

  const promptPassword: Prompts = {};
  if (credential?.inputs) {
    Object.entries(credential.inputs).forEach(([key, value]) => {
      if (typeof value === 'string' && value === 'ASK') {
        promptPassword[`ask_${key}`] = true;
      }
    });
  }

  const initialValues: initialValues = {
    name: credential?.name ?? '',
    description: credential?.description ?? '',
    credential_type: credential?.credential_type ?? 0,
    organization: credential?.organization ?? null,
    ...(credential?.inputs ?? {}),
    ...(promptPassword ?? {}),
  };

  if ((isLoadingCredential && !credential) || (isLoadingCredentialType && !itemsResponse)) {
    return <LoadingPage />;
  }

  const onSubmit: PageFormSubmitHandler<CredentialForm> = async (editedCredential) => {
    const credentialTypeInputs = parsedCredentialTypes?.[editedCredential?.credential_type]?.inputs;
    // can send only one of org, user, team
    if (!editedCredential.organization) {
      editedCredential.user = activeAwxUser?.id;
    }

    const pluginInputs: Record<string, string | number> = {};
    const possibleFields = credentialTypeInputs?.fields || [];
    possibleFields.forEach((field) => {
      if (field.id && typeof field.id === 'string' && field.id in editedCredential) {
        const id = field.id as keyof CredentialForm;
        if (editedCredential[id] !== undefined) {
          pluginInputs[id] = editedCredential[id] as string | number;
          delete editedCredential[id];
        }
      }
    });
    const modifiedCredential = { ...editedCredential, inputs: pluginInputs };
    await patch(awxAPI`/credentials/${id.toString()}/`, modifiedCredential);
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
        defaultValue={initialValues}
      >
        <CredentialInputs
          isEditMode={true}
          credentialTypes={parsedCredentialTypes || {}}
          selectedCredentialTypeId={credential?.credential_type}
          setCredentialPluginValues={setCredentialPluginValues}
        />
      </AwxPageForm>
    </PageLayout>
  );
}

function CredentialInputs({
  isEditMode = false,
  selectedCredentialTypeId,
  credentialTypes,
  setCredentialPluginValues,
  accumulatedPluginValues,
  setAccumulatedPluginValues,
}: {
  isEditMode?: boolean;
  selectedCredentialTypeId?: number;
  credentialTypes: CredentialTypes;
  setCredentialPluginValues?: (values: CredentialPluginsInputSource[]) => void;
  accumulatedPluginValues?: CredentialPluginsInputSource[];
  setAccumulatedPluginValues?: (values: CredentialPluginsInputSource[]) => void;
}) {
  const { t } = useTranslation();

  const watchedCredentialTypeId = useWatch<{ credential_type: number }>({
    name: 'credential_type',
  });

  const credentialTypeID = selectedCredentialTypeId || watchedCredentialTypeId;

  const isGalaxyCredential =
    !!credentialTypes && credentialTypes?.[credentialTypeID]?.kind === 'galaxy';
  return (
    <>
      <PageFormTextInput<Credential>
        name="name"
        label={t('Name')}
        placeholder={t('Enter name')}
        isRequired
      />
      <PageFormTextInput<Credential>
        name="description"
        label={t('Description')}
        placeholder={t('Enter description')}
      />
      <PageFormSelectOrganization<Credential> isRequired={isGalaxyCredential} name="organization" />
      <PageFormSelectCredentialType
        name="credential_type"
        isRequired
        isDisabled={
          isEditMode
            ? t(
                'You cannot change the credential type of a credential, as it may break the functionality of the resources using it.'
              )
            : undefined
        }
      />
      {setCredentialPluginValues &&
      credentialTypeID &&
      credentialTypes &&
      credentialTypes[credentialTypeID] ? (
        <CredentialSubForm
          credentialType={credentialTypes[credentialTypeID]}
          setCredentialPluginValues={setCredentialPluginValues}
          isEditMode={isEditMode}
          accumulatedPluginValues={accumulatedPluginValues ? accumulatedPluginValues : []}
          setAccumulatedPluginValues={setAccumulatedPluginValues}
        />
      ) : null}
    </>
  );
}

function PageFormSecretInput({
  field,
  isEditMode,
  credentialType,
  requiredFields,
}: {
  field: CredentialInputField;
  isEditMode: boolean;
  credentialType: CredentialType;
  requiredFields: string[];
}) {
  const [t] = useTranslation();
  const [shouldHideField, setShouldHideField] = useState(field.secret && isEditMode);
  const [clear, setClear] = useState(false);
  const { setValue } = useFormContext();

  const handleHideField = () => {
    setShouldHideField(!shouldHideField);
    setClear(!clear);
  };

  if (field.multiline) {
    if (field.secret && isEditMode) {
      return (
        <SecretManagementInputField
          onClear={handleHideField}
          shouldHideField={shouldHideField}
          label={field.label}
          placeholder={t('$ENCRYPTED')}
        >
          <InputGroup>
            <Tooltip content={t(`Reset`)}>
              <Button
                size="sm"
                variant="control"
                onClick={handleHideField}
                icon={<RedoIcon />}
              ></Button>
            </Tooltip>
            <CredentialMultilineInput
              kind={credentialType.kind}
              field={field}
              requiredFields={requiredFields}
            />
          </InputGroup>
        </SecretManagementInputField>
      );
    } else if (credentialType.kind === 'ssh' && field.id === 'become_method') {
      return (
        <BecomeMethodField
          key={field.id}
          fieldOptions={field}
          isRequired={requiredFields.includes(field.id)}
        />
      );
    } else {
      return (
        <CredentialMultilineInput
          kind={credentialType.kind}
          field={field}
          requiredFields={requiredFields}
        />
      );
    }
  } else {
    if (field.secret && isEditMode) {
      return (
        <SecretManagementInputField
          onClear={() => {
            setValue(field.id, '');
            setShouldHideField(!shouldHideField);
          }}
          shouldHideField={shouldHideField}
          label={field.label}
          placeholder={t('$ENCRYPTED')}
        >
          <InputGroup>
            <InputGroupItem>
              <Button
                size="sm"
                variant="control"
                onClick={handleHideField}
                icon={<RedoIcon />}
              ></Button>
            </InputGroupItem>
            <InputGroupItem>
              <CredentialTextInput
                field={field}
                isRequired={requiredFields.includes(field.id)}
                credentialType={credentialType}
              />
            </InputGroupItem>
          </InputGroup>
        </SecretManagementInputField>
      );
    } else {
      return (
        <CredentialTextInput
          field={field}
          isRequired={requiredFields.includes(field.id)}
          credentialType={credentialType}
        />
      );
    }
  }
}

function CredentialSubForm(
  {
    credentialType,
    setCredentialPluginValues,
    isEditMode = false,
    accumulatedPluginValues,
    setAccumulatedPluginValues,
  }: {
    credentialType: CredentialType | undefined;
    setCredentialPluginValues: (values: CredentialPluginsInputSource[]) => void;
    isEditMode?: boolean;
    accumulatedPluginValues: CredentialPluginsInputSource[];
    setAccumulatedPluginValues?: (values: CredentialPluginsInputSource[]) => void;
  },
  { onClear /*shouldHideField*/ }: SecretInput
) {
  const { t } = useTranslation();
  if (!credentialType || !credentialType?.inputs?.fields) {
    return null;
  }

  const stringFields =
    credentialType?.inputs?.fields?.filter(
      (field) => field.type === 'string' && !field?.choices?.length
    ) || [];

  const choiceFields =
    credentialType?.inputs?.fields?.filter((field) => (field?.choices?.length ?? 0) > 0) || [];

  const booleanFields =
    credentialType?.inputs?.fields?.filter((field) => field.type === 'boolean') || [];

  const requiredFields = credentialType?.inputs?.required || [];

  const hasFields = stringFields.length > 0 || choiceFields.length > 0 || booleanFields.length > 0;
  return hasFields ? (
    <PageFormSection title={t('Type Details')}>
      {stringFields.length > 0 &&
        stringFields.map((field) => {
          if (field?.multiline) {
            return (
              <PageFormSecret
                key={field.id}
                onClear={() => {}}
                shouldHideField={field.secret && isEditMode}
                label={field.label}
                placeholder={'ENCRYPTED'}
              >
                <CredentialMultilineInput
                  accumulatedPluginValues={accumulatedPluginValues}
                  kind={credentialType.kind}
                  key={field.id}
                  field={field}
                  requiredFields={requiredFields}
                  handleModalToggle={() => {
                    openCredentialPluginsModal({
                      field,
                      setCredentialPluginValues,
                      accumulatedPluginValues,
                    });
                  }}
                />
              </PageFormSecret>
            );
          } else if (credentialType.kind === 'ssh' && field.id === 'become_method') {
            return (
              <BecomeMethodField
                key={field.id}
                fieldOptions={field}
                isRequired={requiredFields.includes(field.id)}
              />
            );
          } else {
            return (
              <PageFormSecret
                key={field.id}
                onClear={() => {}}
                shouldHideField={field.secret && isEditMode}
                label={field.label}
                placeholder={'ENCRYPTED'}
              >
                <CredentialTextInput
                  accumulatedPluginValues={accumulatedPluginValues}
                  setAccumulatedPluginValues={setAccumulatedPluginValues}
                  key={field.id}
                  field={field}
                  isDisabled={
                    field.id === 'vault_id' && credentialType.kind === 'vault' && isEditMode
                  }
                  isRequired={requiredFields.includes(field.id)}
                  handleModalToggle={() =>
                    openCredentialPluginsModal({
                      field,
                      setCredentialPluginValues,
                      accumulatedPluginValues,
                    })
                  }
                  credentialType={credentialType}
                />
              </PageFormSecret>
            );
          }
        })}
      {choiceFields.length > 0 &&
        choiceFields.map((field) => (
          <PageFormSelect<CredentialSelectProps>
            key={field.id}
            defaultValue={field?.default}
            name={field?.id as keyof CredentialSelectProps}
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
  ) : null;
}

function CredentialTextInput({
  credentialType,
  field,
  handleModalToggle,
  isDisabled = false,
  isRequired = false,
  accumulatedPluginValues,
  setAccumulatedPluginValues,
}: {
  credentialType?: CredentialType | undefined;
  field: CredentialInputField;
  handleModalToggle: () => void;
  isDisabled?: boolean;
  isRequired?: boolean;
  accumulatedPluginValues: CredentialPluginsInputSource[];
  setAccumulatedPluginValues?: (values: CredentialPluginsInputSource[]) => void;
}) {
  const { t } = useTranslation();
  const { setValue, clearErrors } = useFormContext();
  const isPromptOnLaunchChecked = useWatch({ name: `ask_${field.id}` }) as boolean;
  const useGetSourceCredential = (id: number) => {
    const { data } = useGetItem<Credential>(awxAPI`/credentials/`, id);
    return data;
  };
  const sourceCredential = useGetSourceCredential(
    accumulatedPluginValues.filter((cp) => cp.input_field_name === field.id)[0]?.source_credential
  );
  const onClear = () => {
    setValue(field.id, '', { shouldDirty: false });
    clearErrors(field.id);
    setAccumulatedPluginValues?.(
      accumulatedPluginValues.filter((cp) => cp.input_field_name !== field.id)
    );
  };

  useEffect(() => {
    if (field?.ask_at_runtime) {
      setValue(field?.id, isPromptOnLaunchChecked ? 'ASK' : field?.default || '', {
        shouldDirty: true,
      });
      if (isPromptOnLaunchChecked) {
        clearErrors(field?.id);
      }
    }
  }, [
    isPromptOnLaunchChecked,
    field?.ask_at_runtime,
    field.id,
    field.default,
    setValue,
    clearErrors,
  ]);

  const handleIsRequired = (): boolean => {
    if (isPromptOnLaunchChecked) {
      return false;
    }
    if (isRequired) {
      return true;
    }
    return false;
  };

  const handleIsDisabled = (field: CredentialInputField): boolean => {
    let isDisabled = false;
    accumulatedPluginValues.forEach((cp) => {
      if (cp.input_field_name === field.id) {
        isDisabled = true;
      }
    });
    return isDisabled;
  };

  const handleHelperText = (field: CredentialInputField): string => {
    let helperText = '';
    accumulatedPluginValues.forEach((cp) => {
      if (cp.input_field_name === field.id) {
        helperText = t(
          'This field will be retrieved from an external secret management system using the specified credential.'
        );
      }
    });
    return helperText;
  };

  const renderFieldValue = useCallback(
    (field: CredentialInputField): string => {
      let placeholder = '';
      accumulatedPluginValues.forEach((cp) => {
        if (cp.input_field_name === field.id && sourceCredential) {
          placeholder = t(`Value is managed by ${sourceCredential.kind}: ${sourceCredential.name}`);
        }
      });
      return placeholder;
    },
    [accumulatedPluginValues, sourceCredential, t]
  );

  useEffect(() => {
    // if field id matches accumulatedPluginValues input_field_name, set value to kind: credential name
    if (accumulatedPluginValues.some((cp) => cp.input_field_name === field.id)) {
      setValue(field.id, renderFieldValue(field), { shouldDirty: true });
    }
  }, [setValue, accumulatedPluginValues, renderFieldValue, field]);
  return (
    <>
      <PageFormTextInput
        key={field.id}
        name={field.id}
        label={field.label}
        placeholder={(field?.default || t('Enter value')).toString()}
        type={field.secret ? 'password' : 'text'}
        isRequired={handleIsRequired()}
        isDisabled={!!isPromptOnLaunchChecked || isDisabled}
        isReadOnly={handleIsDisabled(field)}
        labelHelp={field.help_text}
        helperText={handleHelperText(field)}
        button={
          credentialType?.kind !== 'external' ? (
            <>
              <Button
                isDisabled={isDisabled}
                data-cy={'secret-management-input'}
                variant="control"
                icon={
                  <Icon>
                    <KeyIcon />
                  </Icon>
                }
                onClick={handleModalToggle}
              ></Button>
              {accumulatedPluginValues.some((cp) => cp.input_field_name === field.id) ? (
                <Button
                  data-cy={'clear-secret-management-input'}
                  variant="control"
                  onClick={onClear}
                >
                  {t(`Clear`)}
                </Button>
              ) : null}
            </>
          ) : null
        }
        additionalControls={
          field?.ask_at_runtime && (
            <PageFormCheckbox name={`ask_${field.id}`} label={t('Prompt on launch')} />
          )
        }
      />
    </>
  );
}
