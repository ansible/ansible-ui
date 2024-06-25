import { Button, ButtonVariant, Icon, Tooltip } from '@patternfly/react-core';
import { KeyIcon, UndoIcon } from '@patternfly/react-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useSWRConfig } from 'swr';
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
import { useDeleteRequest } from '../../../common/crud/useDeleteRequest';
import { useGet, useGetItem } from '../../../common/crud/useGet';
import { usePatchRequest } from '../../../common/crud/usePatchRequest';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { awxAPI } from '../../common/api/awx-utils';
import { AwxItemsResponse } from '../../common/AwxItemsResponse';
import { AwxPageForm } from '../../common/AwxPageForm';
import { useAwxActiveUser } from '../../common/useAwxActiveUser';
import { useAwxGetAllPages } from '../../common/useAwxGetAllPages';
import { Credential } from '../../interfaces/Credential';
import { CredentialInputSource } from '../../interfaces/CredentialInputSource';
import { CredentialInputField, CredentialType } from '../../interfaces/CredentialType';
import { AwxRoute } from '../../main/AwxRoutes';
import { PageFormSelectOrganization } from '../organizations/components/PageFormOrganizationSelect';
import { BecomeMethodField } from './components/BecomeMethodField';
import { CredentialMultilineInput } from './components/CredentialMultilineInput';
import { GCEUploadField } from './components/GCEUploadField';
import { PageFormSelectCredentialType } from './components/PageFormSelectCredentialType';
import {
  CredentialPluginsInputSource,
  useCredentialPluginsModal,
} from './CredentialPlugins/hooks/useCredentialPluginsDialog';
import { useCredentialsTestModal } from './hooks/useCredentialsTestModal';

interface CredentialForm extends Credential {
  user?: number;
}

interface CredentialSelectProps extends CredentialInputField {
  name: string;
}

export interface initialValues {
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
  const [selectedCredentialTypeId, setSelectedCredentialTypeId] = useState<number>(0);
  const [watchedSubFormFields, setWatchedSubFormFields] = useState<unknown[]>([]);
  const openCredentialsExternalTestModal = useCredentialsTestModal();
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
  const [isTestButtonEnabled, setIsTestButtonEnabled] = useState(false);
  const [isTestButtonEnabledSubForm, setIsTestButtonEnabledSubForm] = useState(false);

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

  const isExternalCredential =
    !!parsedCredentialTypes &&
    parsedCredentialTypes?.[selectedCredentialTypeId]?.kind === 'external';

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
        if (credential[id] !== undefined || credential[id] !== '') {
          pluginInputs[id] = credential[id] as string | number;
          delete credential[id];
        }
      }
    });
    // can send only one of org, user, team
    if (!credential.organization) {
      credential.user = activeAwxUser?.id;
    }
    // filter out fields that a prefixed with 'ask_'
    Object.keys(credential).forEach((key) => {
      if (key.startsWith('ask_')) {
        delete credential[key as keyof CredentialForm];
      }
    });
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
        title={t('Create credential')}
        breadcrumbs={[
          { label: t('Credentials'), to: getPageUrl(AwxRoute.Credentials) },
          { label: t('Create credential') },
        ]}
      />
      <AwxPageForm
        submitText={t('Create credential')}
        onSubmit={onSubmit}
        onCancel={() => navigate(-1)}
        additionalActions={
          isExternalCredential ? (
            <Button
              aria-label={t('Test')}
              variant="secondary"
              onClick={(e) => {
                e.preventDefault();
                openCredentialsExternalTestModal({
                  credentialType:
                    parsedCredentialTypes !== undefined
                      ? parsedCredentialTypes?.[selectedCredentialTypeId]
                      : ({} as CredentialType),
                  watchedSubFormFields: watchedSubFormFields,
                });
              }}
              isDisabled={!isTestButtonEnabled || !isTestButtonEnabledSubForm}
            >
              {t('Test')}
            </Button>
          ) : undefined
        }
      >
        <CredentialInputs
          isEditMode={false}
          credentialTypes={parsedCredentialTypes || {}}
          setCredentialPluginValues={setCredentialPluginValues}
          accumulatedPluginValues={accumulatedPluginValues}
          setAccumulatedPluginValues={setAccumulatedPluginValues}
          setSelectedCredentialTypeId={setSelectedCredentialTypeId}
          setIsTestButtonEnabled={setIsTestButtonEnabled}
          setIsTestButtonEnabledSubForm={setIsTestButtonEnabledSubForm}
          setWatchedSubFormFields={setWatchedSubFormFields}
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
  const openCredentialsExternalTestModal = useCredentialsTestModal();
  const [isTestButtonEnabled, setIsTestButtonEnabled] = useState(false);
  const [isTestButtonEnabledSubForm, setIsTestButtonEnabledSubForm] = useState(false);
  const [watchedSubFormFields, setWatchedSubFormFields] = useState<unknown[]>([]);
  const [fieldEncryptedID, setFieldEncryptedID] = useState<string[]>([]);

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

  const isExternalCredential =
    !!parsedCredentialTypes && credential !== undefined
      ? parsedCredentialTypes?.[credential.credential_type]?.kind === 'external'
      : null;

  const promptPassword: Prompts = useMemo(() => {
    const promptPasswordObj: Prompts = {};
    if (credential?.inputs) {
      Object.entries(credential.inputs).forEach(([key, value]) => {
        if (typeof value === 'string' && value === 'ASK') {
          promptPasswordObj[`ask_${key}`] = true;
        } else {
          promptPasswordObj[`ask_${key}`] = false;
        }
      });
    }
    return promptPasswordObj;
  }, [credential]);

  const initialValues: initialValues = useMemo(
    () => ({
      name: credential?.name ?? '',
      description: credential?.description ?? '',
      credential_type: credential?.credential_type ?? 0,
      organization: credential?.organization ?? null,
      ...(credential?.inputs ?? {}),
      ...(promptPassword ?? {}),
    }),
    [credential, promptPassword]
  );

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
        if (editedCredential[id] !== undefined || editedCredential[id] !== '') {
          pluginInputs[id] = editedCredential[id] as string | number;
          delete editedCredential[id];
        }
      }
    });
    // filter out fields that a prefixed with 'ask_'
    Object.keys(editedCredential).forEach((key) => {
      if (key.startsWith('ask_')) {
        delete editedCredential[key as keyof CredentialForm];
      }
    });
    // The field's value was set to ENCRYPTED as a placeholder, so it must be
    // reverted to the original value
    Object.keys(pluginInputs).forEach((key) => {
      if (fieldEncryptedID?.includes(key)) {
        pluginInputs[key as keyof CredentialForm] = '$encrypted$';
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
        title={
          credential?.name
            ? t('Edit {{credentialName}}', { credentialName: credential?.name })
            : t('Credentials')
        }
        breadcrumbs={[
          { label: t('Credentials'), to: getPageUrl(AwxRoute.Credentials) },
          {
            label: credential?.name
              ? t('Edit {{credentialName}}', { credentialName: credential?.name })
              : t('Credentials'),
          },
        ]}
      />
      <AwxPageForm
        submitText={t('Save credential')}
        onSubmit={onSubmit}
        onCancel={() => navigate(-1)}
        defaultValue={initialValues}
        additionalActions={
          isExternalCredential ? (
            <Button
              aria-label={t('Test')}
              variant="secondary"
              onClick={(e) => {
                e.preventDefault();
                openCredentialsExternalTestModal({
                  credential: credential,
                  credentialType:
                    parsedCredentialTypes !== undefined
                      ? parsedCredentialTypes?.[credential?.credential_type]
                      : ({} as CredentialType),
                  watchedSubFormFields: watchedSubFormFields,
                });
              }}
              isDisabled={!isTestButtonEnabled || !isTestButtonEnabledSubForm}
            >
              {t('Test')}
            </Button>
          ) : undefined
        }
      >
        <CredentialInputs
          isEditMode
          credentialTypes={parsedCredentialTypes || {}}
          selectedCredentialTypeId={credential?.credential_type}
          setCredentialPluginValues={setCredentialPluginValues}
          accumulatedPluginValues={accumulatedPluginValues}
          setAccumulatedPluginValues={setAccumulatedPluginValues}
          setPluginsToDelete={setPluginsToDelete}
          setIsTestButtonEnabled={setIsTestButtonEnabled}
          setIsTestButtonEnabledSubForm={setIsTestButtonEnabledSubForm}
          setWatchedSubFormFields={setWatchedSubFormFields}
          initialValues={initialValues}
          setFieldEncryptedID={setFieldEncryptedID}
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
  setSelectedCredentialTypeId,
  setIsTestButtonEnabled,
  setIsTestButtonEnabledSubForm,
  setWatchedSubFormFields,
  setFieldEncryptedID,
  initialValues,
}: {
  isEditMode?: boolean;
  selectedCredentialTypeId?: number;
  credentialTypes: CredentialTypes;
  setCredentialPluginValues?: (values: CredentialPluginsInputSource[]) => void;
  accumulatedPluginValues?: CredentialPluginsInputSource[];
  setAccumulatedPluginValues?: (values: CredentialPluginsInputSource[]) => void;
  setPluginsToDelete?: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedCredentialTypeId?: (id: number) => void;
  setIsTestButtonEnabled: (enabled: boolean) => void;
  setIsTestButtonEnabledSubForm: (enabled: boolean) => void;
  setWatchedSubFormFields: (fields: unknown[]) => void;
  setFieldEncryptedID?: React.Dispatch<React.SetStateAction<string[]>>;
  initialValues?: initialValues;
}) {
  const { t } = useTranslation();

  const watchedCredentialTypeId = useWatch<{ credential_type: number }>({
    name: 'credential_type',
  });

  useEffect(() => {
    if (setSelectedCredentialTypeId) {
      setSelectedCredentialTypeId(watchedCredentialTypeId);
    }
  }, [watchedCredentialTypeId, setSelectedCredentialTypeId]);

  const credentialTypeID = selectedCredentialTypeId || watchedCredentialTypeId;

  const isGalaxyCredential =
    !!credentialTypes && credentialTypes?.[credentialTypeID]?.kind === 'galaxy';

  const watchedRequiredFields = useWatch<{
    name: string;
    credential_type: number;
  }>({
    name: ['name', 'credential_type'],
  });

  useEffect(() => {
    const requiredFields = ['name', 'credential_type'];
    const verify: string[] = [];
    Object.values(watchedRequiredFields).forEach((value) => {
      if (value !== null && value !== undefined && value !== '') {
        verify.push(value as string);
      }
    });

    setIsTestButtonEnabled(verify.length >= requiredFields.length ? true : false);
  }, [watchedRequiredFields, setIsTestButtonEnabled]);

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
          initialValues={initialValues}
          accumulatedPluginValues={accumulatedPluginValues ? accumulatedPluginValues : []}
          setAccumulatedPluginValues={setAccumulatedPluginValues}
          setPluginsToDelete={setPluginsToDelete}
          setIsTestButtonEnabledSubForm={setIsTestButtonEnabledSubForm}
          setWatchedSubFormFields={setWatchedSubFormFields}
          setFieldEncryptedID={setFieldEncryptedID}
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
  setIsTestButtonEnabledSubForm,
  setWatchedSubFormFields,
  setFieldEncryptedID,
  initialValues,
}: {
  credentialType: CredentialType;
  setCredentialPluginValues: (values: CredentialPluginsInputSource[]) => void;
  isEditMode?: boolean;
  accumulatedPluginValues: CredentialPluginsInputSource[];
  setAccumulatedPluginValues?: (values: CredentialPluginsInputSource[]) => void;
  setPluginsToDelete?: React.Dispatch<React.SetStateAction<string[]>>;
  setIsTestButtonEnabledSubForm: (enabled: boolean) => void;
  setWatchedSubFormFields: (fields: unknown[]) => void;
  setFieldEncryptedID?: React.Dispatch<React.SetStateAction<string[]>>;
  initialValues?: initialValues;
}) {
  const { t } = useTranslation();
  const openCredentialPluginsModal = useCredentialPluginsModal();
  const requiredFields = credentialType?.inputs?.required || [];
  const requiredFieldsInSubForm = credentialType?.inputs?.fields?.filter((field) =>
    requiredFields.includes(field.id)
  );
  const subFormFields = credentialType?.inputs?.fields?.map((field) => field.id);

  const watchedRequiredFields = useWatch({
    name: requiredFields,
  });

  const watchedAllFields = useWatch({ name: subFormFields });
  setWatchedSubFormFields(watchedAllFields);

  useEffect(() => {
    const verify: string[] = [];
    Object.values(watchedRequiredFields).forEach((value) => {
      if (value !== null && value !== undefined && value !== '') {
        verify.push(value as string);
      }
    });

    setIsTestButtonEnabledSubForm(verify.length >= requiredFieldsInSubForm?.length ? true : false);
  }, [watchedRequiredFields, setIsTestButtonEnabledSubForm, requiredFieldsInSubForm]);

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

  const hasFields = stringFields.length > 0 || choiceFields.length > 0 || booleanFields.length > 0;

  return hasFields ? (
    <PageFormSection title={t('Type Details')}>
      {credentialType?.namespace === 'gce' && <GCEUploadField />}
      {stringFields.length > 0 &&
        stringFields.map((field) => {
          if (field?.multiline) {
            return (
              <CredentialMultilineInput
                accumulatedPluginValues={accumulatedPluginValues}
                setAccumulatedPluginValues={setAccumulatedPluginValues}
                setPluginsToDelete={setPluginsToDelete}
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
                fieldInitialValue={initialValues && initialValues[field?.id]}
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
                setFieldEncryptedID={setFieldEncryptedID}
                accumulatedPluginValues={accumulatedPluginValues}
                setAccumulatedPluginValues={setAccumulatedPluginValues}
                setPluginsToDelete={setPluginsToDelete}
                key={field.id}
                field={field}
                credentialType={credentialType}
                fieldInitialValue={initialValues && initialValues[field?.id]}
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
  setFieldEncryptedID,
  fieldInitialValue,
}: {
  credentialType?: CredentialType | undefined;
  field: CredentialInputField;
  handleModalToggle: () => void;
  isDisabled?: boolean;
  isRequired?: boolean;
  accumulatedPluginValues: CredentialPluginsInputSource[];
  setAccumulatedPluginValues?: (values: CredentialPluginsInputSource[]) => void;
  setPluginsToDelete?: React.Dispatch<React.SetStateAction<string[]>>;
  setFieldEncryptedID?: React.Dispatch<React.SetStateAction<string[]>>;
  fieldInitialValue?: string | boolean | number | null | undefined;
}) {
  const { t } = useTranslation();
  const { setValue, clearErrors, getValues } = useFormContext();
  const [isRevert, setIsRevert] = useState(false);
  const encryptedPlaceholder = '$encrypted$';
  const ASK_VALUE = 'ASK';
  const isSecretField = field.secret;
  const isInitialValueEncrypted = fieldInitialValue === encryptedPlaceholder;
  const [shouldHideField, setShouldHideField] = useState(isSecretField && isInitialValueEncrypted);
  const [isCurrentFieldValueEncrypted, setIsCurrentFieldValueEncrypted] = useState(false);

  const isPromptOnLaunchChecked = useWatch({
    name: `ask_${field.id}`,
    defaultValue: fieldInitialValue === ASK_VALUE,
  }) as boolean;

  const useGetSourceCredential = (id: number) => {
    const { data } = useGetItem<Credential>(awxAPI`/credentials/`, id);
    return data;
  };

  const sourceCredential = useGetSourceCredential(
    accumulatedPluginValues.filter((cp) => cp.input_field_name === field.id)[0]?.source_credential
  );

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

  const clearFieldValue = useCallback(() => {
    if (getValues(field.id) !== ASK_VALUE) {
      setValue(field.id, '', { shouldDirty: false });
    }
    clearErrors(field.id);
    setAccumulatedPluginValues?.(
      accumulatedPluginValues.filter((cp) => cp.input_field_name !== field.id)
    );
    setPluginsToDelete?.((prev: string[]) => [...prev, field.id]);
  }, [
    getValues,
    setValue,
    clearErrors,
    field.id,
    accumulatedPluginValues,
    setAccumulatedPluginValues,
    setPluginsToDelete,
  ]);

  useEffect(() => {
    if (isPromptOnLaunchChecked) {
      // mark any credential plugins previously set for deletion
      if (accumulatedPluginValues.some((cp) => cp.input_field_name === field.id)) {
        setPluginsToDelete?.((prev: string[]) => [...prev, field.id]);
        setAccumulatedPluginValues?.(
          accumulatedPluginValues.filter((cp) => cp.input_field_name !== field.id)
        );
      }
      setValue(field.id, ASK_VALUE, { shouldDirty: true });
      clearErrors(field.id);
    } else if (!isPromptOnLaunchChecked && getValues(field.id) === ASK_VALUE) {
      setValue(field.id, '', { shouldDirty: true });
    }
  }, [
    getValues,
    isPromptOnLaunchChecked,
    field,
    setValue,
    setPluginsToDelete,
    accumulatedPluginValues,
    setAccumulatedPluginValues,
    clearErrors,
  ]);

  useEffect(() => {
    if (isPromptOnLaunchChecked) {
      clearFieldValue();
      setIsRevert(true);
      setShouldHideField(false);
    }
  }, [isPromptOnLaunchChecked, clearFieldValue]);

  useEffect(() => {
    if (accumulatedPluginValues.some((cp) => cp.input_field_name === field.id)) {
      setValue(field.id, renderFieldValue(field), { shouldDirty: true });
    }
  }, [setValue, accumulatedPluginValues, renderFieldValue, field]);

  const handleIsRequired = (): boolean => {
    if (isPromptOnLaunchChecked) {
      return false;
    }
    return isRequired;
  };

  const handleIsDisabled = (field: CredentialInputField): boolean => {
    return accumulatedPluginValues.some((cp) => cp.input_field_name === field.id);
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

  const clearField = () => {
    setValue(field.id, '', { shouldDirty: false });
    setShouldHideField(false);
  };

  const revertInitialValue = () => {
    setValue(field.id, fieldInitialValue, { shouldDirty: true });
    setAccumulatedPluginValues?.(
      accumulatedPluginValues.filter((cp) => cp.input_field_name !== field.id)
    );
    setShouldHideField(true);
  };

  useEffect(() => {
    if (
      field?.id &&
      shouldHideField &&
      isSecretField &&
      isInitialValueEncrypted &&
      !isPromptOnLaunchChecked
    ) {
      setValue(field.id, t('ENCRYPTED'), { shouldDirty: false });
      setFieldEncryptedID &&
        setFieldEncryptedID((prev: string[]) =>
          prev.includes(field.id) ? prev : [...prev, field.id]
        );
      setIsCurrentFieldValueEncrypted(true);
    } else {
      setIsCurrentFieldValueEncrypted(false);
      setFieldEncryptedID &&
        setFieldEncryptedID((prev: string[]) => prev.filter((id) => id !== field.id));
    }
  }, [
    setFieldEncryptedID,
    shouldHideField,
    isSecretField,
    isInitialValueEncrypted,
    isPromptOnLaunchChecked,
    field.id,
    setValue,
    t,
  ]);

  const shouldShowRevertButton = !isPromptOnLaunchChecked && isInitialValueEncrypted;

  const inputType =
    getValues(field.id) === ASK_VALUE || (field.secret && !isCurrentFieldValueEncrypted)
      ? 'password'
      : 'text';

  return (
    <PageFormTextInput
      key={field.id}
      name={field.id}
      label={field.label}
      placeholder={(field?.default || t('Enter value')).toString()}
      type={inputType}
      isRequired={handleIsRequired()}
      isDisabled={isDisabled || !!isPromptOnLaunchChecked || isCurrentFieldValueEncrypted}
      isReadOnly={handleIsDisabled(field)}
      labelHelp={field.help_text}
      helperText={handleHelperText(field)}
      button={
        credentialType?.kind !== 'external' ? (
          <>
            <Tooltip
              flipBehavior={['top', 'bottom']}
              content={t('Populate field from an external secret management system')}
            >
              <Button
                isDisabled={isDisabled || !!isPromptOnLaunchChecked || isCurrentFieldValueEncrypted}
                data-cy="secret-management-input"
                variant="control"
                icon={
                  <Icon>
                    <KeyIcon />
                  </Icon>
                }
                onClick={handleModalToggle}
              />
            </Tooltip>
            {accumulatedPluginValues.some((cp) => cp.input_field_name === field.id) && (
              <Button
                data-cy="clear-secret-management-input"
                variant="control"
                onClick={clearFieldValue}
              >
                {t('Clear')}
              </Button>
            )}
            {shouldShowRevertButton ? (
              <RevertReplaceButton
                clearField={clearField}
                isRevert={isRevert}
                revertField={revertInitialValue}
                setIsRevert={setIsRevert}
              />
            ) : null}
          </>
        ) : shouldShowRevertButton ? (
          <RevertReplaceButton
            clearField={clearField}
            isRevert={isRevert}
            revertField={revertInitialValue}
            setIsRevert={setIsRevert}
          />
        ) : null
      }
      additionalControls={
        field?.ask_at_runtime && (
          <PageFormCheckbox name={`ask_${field.id}`} label={t('Prompt on launch')} />
        )
      }
    />
  );
}

const RevertReplaceButton = ({
  clearField,
  revertField,
  isRevert,
  setIsRevert,
}: {
  clearField: () => void;
  revertField: () => void;
  isRevert: boolean;
  setIsRevert: (isRevert: boolean) => void;
}) => {
  const { t } = useTranslation();
  return (
    <Tooltip content={isRevert ? t('Revert') : t('Replace')}>
      <Button
        id="credential-replace-button"
        aria-label={
          isRevert ? t('Revert field to previously saved value') : t('Replace field with new value')
        }
        variant={ButtonVariant.control}
        icon={<UndoIcon />}
        onClick={() => {
          if (isRevert) {
            revertField();
          } else {
            clearField();
          }
          setIsRevert(!isRevert);
        }}
      />
    </Tooltip>
  );
};
