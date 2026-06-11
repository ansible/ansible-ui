import {
  LoadingPage,
  PageFormCheckbox,
  PageFormSelect,
  PageFormTextArea,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { PageFormTextInput } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormTextInput';
import { PageFormSubmitHandler } from '@ansible/ansible-ui-framework/PageForm/PageForm';
import { PageFormSection } from '@ansible/ansible-ui-framework/PageForm/Utils/PageFormSection';
import { useDeleteRequest } from '@ansible/common-ui/crud/useDeleteRequest';
import { useGet, useGetItem } from '@ansible/common-ui/crud/useGet';
import { usePatchRequest } from '@ansible/common-ui/crud/usePatchRequest';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { Alert, Button, ButtonVariant, Icon, Tooltip } from '@patternfly/react-core';
import { KeyIcon, UndoIcon } from '@patternfly/react-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { awxAPI } from '../../common/api/awx-utils';
import { AwxItemsResponse } from '../../common/AwxItemsResponse';
import { AwxPageForm } from '../../common/AwxPageForm';
import { useAwxActiveUser } from '../../common/useAwxActiveUser';
import { useAwxGetAllPages } from '../../common/useAwxGetAllPages';
import { useFeatureFlag } from '../../common/useFeatureFlags';
import { Credential } from '../../interfaces/Credential';
import { CredentialInputSource } from '../../interfaces/CredentialInputSource';
import { CredentialInputField, CredentialType } from '../../interfaces/CredentialType';
import { AwxRoute } from '../../main/AwxRoutes';
import { PageFormSelectOrganization } from '../organizations/components/PageFormOrganizationSelect';
import { BecomeMethodField } from './components/BecomeMethodField';
import { CredentialMultilineInput } from './components/CredentialMultilineInput';
import { GCEUploadField } from './components/GCEUploadField';
import { HashiCorpVaultOidcInfoSection } from './components/HashiCorpVaultOidcInfoSection';
import { PageFormSelectCredentialType } from './components/PageFormSelectCredentialType';
import {
  CredentialPluginsInputSource,
  useCredentialPluginsModal,
} from './CredentialPlugins/hooks/useCredentialPluginsDialog';
import { useCredentialsTestModal } from './hooks/useCredentialsTestModal';

interface CredentialForm extends Omit<Credential, 'inputs'> {
  user?: number;
  inputs: Record<string, string | number | { name: string } | undefined>;
}

interface CredentialSelectProps extends CredentialInputField {
  name: string;
}

export interface InitialValues {
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
  const postRequest = usePostRequest<CredentialForm | CredentialInputSource, Credential>();

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
    const pluginInputs: CredentialForm['inputs'] = {};
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
    let payload = { ...credential, inputs: pluginInputs };
    if (typeof pluginInputs.become_method === 'object' && 'name' in pluginInputs.become_method) {
      payload = {
        ...credential,
        inputs: {
          ...pluginInputs,
          become_method: pluginInputs.become_method?.name ?? undefined,
        },
      };
    }
    const newCredential = await postRequest(awxAPI`/credentials/`, payload);
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
        onCancel={() => void navigate(-1)}
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
          id: inputSource.id, // Preserve the ID to identify existing sources
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

  const initialValues: InitialValues = useMemo(
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
    const pluginInputs: CredentialForm['inputs'] = {};
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

    let modifiedCredential = { ...editedCredential, inputs: pluginInputs };
    if (typeof pluginInputs.become_method === 'object' && 'name' in pluginInputs.become_method) {
      modifiedCredential = {
        ...modifiedCredential,
        inputs: {
          ...pluginInputs,
          become_method: pluginInputs.become_method?.name ?? undefined,
        },
      };
    }
    // Only POST new credential input sources (those without an id)
    // Existing sources (with an id) that haven't been modified don't need to be re-created
    const newCredentialInputSources = accumulatedPluginValues
      .filter((credentialInputSource) => !credentialInputSource.id)
      .map((credentialInputSource) => ({
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
          newCredentialInputSources.map(async (credentialInputSource) => {
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
        newCredentialInputSources.map(async (credentialInputSource) => {
          await postRequest(
            awxAPI`/credential_input_sources/`,
            credentialInputSource as CredentialInputSource
          );
        })
      );
    }
    void navigate(-1);
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
        onCancel={() => void navigate(-1)}
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
  initialValues?: InitialValues;
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

    setIsTestButtonEnabled(verify.length >= requiredFields.length);
  }, [watchedRequiredFields, setIsTestButtonEnabled]);

  return (
    <>
      <PageFormTextInput<Credential>
        name="name"
        label={t('Name')}
        placeholder={t('Enter credential name')}
        isRequired
      />
      <PageFormTextArea<Credential>
        name="description"
        label={t('Description')}
        placeholder={t('Enter description')}
      />
      <PageFormSelectOrganization<Credential> name="organization" />
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
          credentialType={credentialTypes?.[credentialTypeID]}
          setCredentialPluginValues={setCredentialPluginValues}
          isEditMode={isEditMode}
          initialValues={initialValues}
          accumulatedPluginValues={accumulatedPluginValues || []}
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
  initialValues?: InitialValues;
}) {
  const { t } = useTranslation();
  const oidcFeatureEnabled = useFeatureFlag('FEATURE_OIDC_WORKLOAD_IDENTITY_ENABLED');
  const openCredentialPluginsModal = useCredentialPluginsModal();
  const requiredFields = credentialType?.inputs?.required || [];
  const requiredFieldsInSubForm = credentialType?.inputs?.fields?.filter(
    (field) => !field.internal && requiredFields.includes(field.id)
  );
  const subFormFields = credentialType?.inputs?.fields?.map((field) => field.id);

  const watchedRequiredFields = useWatch({
    name: requiredFields,
  });

  const watchedAllFields = useWatch({ name: subFormFields });
  useEffect(() => {
    setWatchedSubFormFields(watchedAllFields);
  }, [watchedAllFields, setWatchedSubFormFields]);

  useEffect(() => {
    const verify: string[] = [];
    Object.values(watchedRequiredFields).forEach((value) => {
      if (value !== null && value !== undefined && value !== '') {
        verify.push(value as string);
      }
    });

    setIsTestButtonEnabledSubForm(verify.length >= requiredFieldsInSubForm?.length);
  }, [watchedRequiredFields, setIsTestButtonEnabledSubForm, requiredFieldsInSubForm]);

  if (!credentialType?.inputs?.fields) {
    return null;
  }

  const visibleFields = credentialType?.inputs?.fields?.filter((field) => !field.internal) || [];

  const stringFields = visibleFields.filter(
    (field) => field.type === 'string' && !field?.choices?.length
  );

  const choiceFields = visibleFields.filter((field) => (field?.choices?.length ?? 0) > 0);

  const booleanFields = visibleFields.filter((field) => field.type === 'boolean');

  const hasFields = stringFields.length > 0 || choiceFields.length > 0 || booleanFields.length > 0;

  return hasFields ? (
    <PageFormSection title={t('Type Details')}>
      <PageFormSection singleColumn>
        {credentialType?.kind === 'insights' && (
          <Alert
            variant="info"
            isInline
            title={t('Input username and password or client ID and client secret.')}
            data-cy="credential-form-insights-alert"
            data-testid="credential-form-insights-alert"
          >
            <Trans>
              Enter your client ID and client secret to create your Insights credential. See this{' '}
              <Link to="https://access.redhat.com/articles/7108804" target="_">
                <strong>Knowledgebase article</strong>
              </Link>{' '}
              for more detail.
            </Trans>
          </Alert>
        )}
        {(credentialType?.namespace === 'hashivault-kv-oidc' ||
          credentialType?.namespace === 'hashivault-ssh-oidc') &&
          oidcFeatureEnabled && <HashiCorpVaultOidcInfoSection key={credentialType.namespace} />}
      </PageFormSection>
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
                fieldInitialValue={initialValues?.[field?.id]}
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
                fieldInitialValue={initialValues?.[field?.id]}
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
            defaultValue={Boolean(field.default)}
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

  // useEffect to handle prompt on launch changes
  useEffect(() => {
    const currentValue = getValues(field.id) as string;
    // If "Prompt on launch" is checked AND the current value is not "ASK"
    if (isPromptOnLaunchChecked && currentValue !== ASK_VALUE) {
      setValue(field.id, ASK_VALUE, { shouldDirty: true });
      clearErrors(field.id);
      // If there's a credential plugin, mark it for deletion
      if (accumulatedPluginValues.some((cp) => cp.input_field_name === field.id)) {
        setPluginsToDelete?.((prev: string[]) => [...prev, field.id]);
        setAccumulatedPluginValues?.(
          accumulatedPluginValues.filter((cp) => cp.input_field_name !== field.id)
        );
      }
    } // If "Prompt on launch" is unchecked AND the current value is "ASK"
    else if (!isPromptOnLaunchChecked && currentValue === ASK_VALUE) {
      setValue(field.id, '', { shouldDirty: true });
    }
  }, [
    isPromptOnLaunchChecked,
    field.id,
    getValues,
    setValue,
    clearErrors,
    accumulatedPluginValues,
    setPluginsToDelete,
    setAccumulatedPluginValues,
  ]);

  // useEffect to handle plugin values
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
      defaultValue={field?.default?.toString()}
      type={inputType}
      isRequired={handleIsRequired()}
      isDisabled={isDisabled || !!isPromptOnLaunchChecked || isCurrentFieldValueEncrypted}
      isReadOnly={handleIsDisabled(field)}
      labelHelp={field.help_text}
      helperText={handleHelperText(field)}
      autoComplete={field.secret ? 'new-password' : 'off'}
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
                data-testid="secret-management-input"
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
                data-testid="clear-secret-management-input"
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
