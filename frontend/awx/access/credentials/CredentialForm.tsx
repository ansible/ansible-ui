import { useCallback, useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
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
import { useDeleteRequest } from '../../../common/crud/useDeleteRequest';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { AwxPageForm } from '../../common/AwxPageForm';
import { awxAPI } from '../../common/api/awx-utils';
import { useAwxActiveUser } from '../../common/useAwxActiveUser';
import { useAwxGetAllPages } from '../../common/useAwxGetAllPages';
import { Credential } from '../../interfaces/Credential';
import { CredentialInputField, CredentialType } from '../../interfaces/CredentialType';
import { AwxRoute } from '../../main/AwxRoutes';
import { PageFormSelectOrganization } from '../organizations/components/PageFormOrganizationSelect';
import { BecomeMethodField } from './components/BecomeMethodField';
import { CredentialMultilineInput } from './components/CredentialMultilineInput';
import { Button, Icon } from '@patternfly/react-core';
import { KeyIcon } from '@patternfly/react-icons';
import { PageFormSelectCredentialType } from './components/PageFormSelectCredentialType';
import {
  CredentialPluginsInputSource,
  useCredentialPluginsModal,
} from './CredentialPlugins/hooks/useCredentialPluginsDialog';
import { CredentialInputSource } from '../../interfaces/CredentialInputSource';
import { AwxItemsResponse } from '../../common/AwxItemsResponse';
import { useSWRConfig } from 'swr';

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
  const [accumulatedPluginValues, setAccumulatedPluginValues] = useState<
    CredentialPluginsInputSource[]
  >([]);
  useEffect(() => {
    setAccumulatedPluginValues((prev) => {
      // Filter out any previous plugins that have been updated
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
          setAccumulatedPluginValues={setAccumulatedPluginValues}
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
  const deleteRequest = useDeleteRequest();
  const postRequest = usePostRequest<Credential | CredentialInputSource>();
  const [credentialPluginValues, setCredentialPluginValues] = useState<
    CredentialPluginsInputSource[]
  >([]);
  const [accumulatedPluginValues, setAccumulatedPluginValues] = useState<
    CredentialPluginsInputSource[]
  >([]);
  const [pluginsToDelete, setPluginsToDelete] = useState<string[]>([]);
  const { cache } = useSWRConfig();

  useEffect(() => {
    setAccumulatedPluginValues((prev) => {
      // Filter out any values from prev that have input field names matching new values
      const filteredPrev = prev.filter(
        (prevValue) =>
          !credentialPluginValues.some(
            (newValue) => newValue.input_field_name === prevValue.input_field_name
          )
      );
      const updatedValues = [...filteredPrev, ...credentialPluginValues];
      // mark any fields previously handled by a plugin that have been updated to use a different plugin for deletion
      updatedValues.forEach((cp) => {
        if (prev.some((prevValue) => prevValue.input_field_name === cp.input_field_name)) {
          setPluginsToDelete((prev) => [...prev, cp.input_field_name]);
        }
      });

      return updatedValues;
    });
  }, [credentialPluginValues]);

  const { data: credential, isLoading: isLoadingCredential } = useGet<Credential>(
    awxAPI`/credentials/${id.toString()}/`
  );

  const { data: inputSources, isLoading: isLoadingInputSources } = useGet<
    AwxItemsResponse<CredentialInputSource>
  >(awxAPI`/credentials/${id.toString()}/input_sources/`);

  useEffect(() => {
    if (inputSources) {
      const updatedPluginValues = inputSources.results.map(
        (inputSource: CredentialInputSource) => ({
          input_field_name: inputSource.input_field_name,
          source_credential: inputSource.source_credential,
          target_credential: inputSource.target_credential,
          metadata: inputSource.metadata,
        })
      );
      setAccumulatedPluginValues(updatedPluginValues);
    }
  }, [inputSources]);

  const pluginsToDeletePayload = inputSources?.results
    .filter((cp) => pluginsToDelete.includes(cp.input_field_name))
    .map((cp) => cp.id?.toString() ?? '');

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

  if (
    (isLoadingCredential && !credential) ||
    (isLoadingCredentialType && !itemsResponse) ||
    (isLoadingInputSources && !inputSources)
  ) {
    return <LoadingPage />;
  }

  const onSubmit: PageFormSubmitHandler<CredentialForm> = async (editedCredential) => {
    const credentialTypeInputs = parsedCredentialTypes?.[editedCredential?.credential_type]?.inputs;
    // can send only one of org, user, team
    if (!editedCredential.organization) {
      editedCredential.user = activeAwxUser?.id;
    }
    const pluginInputs: Record<string, string | number> = {};
    const isHandledByCredentialPlugin = (field: string) =>
      accumulatedPluginValues.some((cp) => cp.input_field_name === field);

    const possibleFields = credentialTypeInputs?.fields || [];
    possibleFields.forEach((field) => {
      if (
        field.id &&
        typeof field.id === 'string' &&
        field.id in editedCredential &&
        !isHandledByCredentialPlugin(field.id)
      ) {
        const id = field.id as keyof CredentialForm;
        if (editedCredential[id] !== undefined) {
          pluginInputs[id] = editedCredential[id] as string | number;
          delete editedCredential[id];
        }
      }
    });
    const modifiedCredential = { ...editedCredential, inputs: pluginInputs };
    const credentialInputSourcePayload = accumulatedPluginValues.map((credentialInputSource) => ({
      ...credentialInputSource,
      target_credential: credential?.id,
    }));

    if (pluginsToDeletePayload && pluginsToDeletePayload.length > 0) {
      await Promise.all(
        pluginsToDeletePayload.map(async (id) => {
          await deleteRequest(awxAPI`/credential_input_sources/${id.toString()}/`);
        })
      ).then(async () => {
        await patch(awxAPI`/credentials/${id.toString()}/`, modifiedCredential);
        await Promise.all(
          credentialInputSourcePayload.map(async (credentialInputSource) => {
            await postRequest(
              awxAPI`/credential_input_sources/`,
              credentialInputSource as CredentialInputSource
            );
          })
        );
      });
    } else {
      await patch(awxAPI`/credentials/${id.toString()}/`, modifiedCredential);
      await Promise.all(
        credentialInputSourcePayload.map(async (credentialInputSource) => {
          await postRequest(
            awxAPI`/credential_input_sources/`,
            credentialInputSource as CredentialInputSource
          );
        })
      );
    }
    (cache as unknown as { clear: () => void }).clear?.();
    // return to Credential List page
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
          isEditMode
          credentialTypes={parsedCredentialTypes || {}}
          selectedCredentialTypeId={credential?.credential_type}
          setCredentialPluginValues={setCredentialPluginValues}
          accumulatedPluginValues={accumulatedPluginValues}
          setAccumulatedPluginValues={setAccumulatedPluginValues}
          setPluginsToDelete={setPluginsToDelete}
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
  setPluginsToDelete,
}: {
  isEditMode?: boolean;
  selectedCredentialTypeId?: number;
  credentialTypes: CredentialTypes;
  setCredentialPluginValues?: (values: CredentialPluginsInputSource[]) => void;
  accumulatedPluginValues?: CredentialPluginsInputSource[];
  setAccumulatedPluginValues?: (values: CredentialPluginsInputSource[]) => void;
  setPluginsToDelete?: React.Dispatch<React.SetStateAction<string[]>>;
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
          setPluginsToDelete={setPluginsToDelete}
        />
      ) : null}
    </>
  );
}
function CredentialSubForm({
  credentialType,
  setCredentialPluginValues,
  isEditMode = false,
  accumulatedPluginValues,
  setAccumulatedPluginValues,
  setPluginsToDelete,
}: {
  credentialType: CredentialType | undefined;
  setCredentialPluginValues: (values: CredentialPluginsInputSource[]) => void;
  isEditMode?: boolean;
  accumulatedPluginValues: CredentialPluginsInputSource[];
  setAccumulatedPluginValues?: (values: CredentialPluginsInputSource[]) => void;
  setPluginsToDelete?: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const { t } = useTranslation();
  const openCredentialPluginsModal = useCredentialPluginsModal();
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
              <CredentialTextInput
                accumulatedPluginValues={accumulatedPluginValues}
                setAccumulatedPluginValues={setAccumulatedPluginValues}
                setPluginsToDelete={setPluginsToDelete}
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
              />
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
  setPluginsToDelete,
}: {
  credentialType?: CredentialType | undefined;
  field: CredentialInputField;
  handleModalToggle: () => void;
  isDisabled?: boolean;
  isRequired?: boolean;
  accumulatedPluginValues: CredentialPluginsInputSource[];
  setAccumulatedPluginValues?: (values: CredentialPluginsInputSource[]) => void;
  setPluginsToDelete?: React.Dispatch<React.SetStateAction<string[]>>;
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
    setPluginsToDelete?.((prev: string[]) => [...prev, field.id]);
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
    // mark field as managed by a credential plugin
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
          ) : undefined
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
