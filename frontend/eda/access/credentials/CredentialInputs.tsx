import { PageFormTextArea, PageFormTextInput } from '@ansible/ansible-ui-framework';
import { PageFormSection } from '@ansible/ansible-ui-framework/PageForm/Utils/PageFormSection';
import { NoAutofillDiv } from '@ansible/common-ui/components/NoAutofill';
import { Dispatch, SetStateAction, useCallback, useEffect } from 'react';
import { FieldPath, FieldValues, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { EdaCredentialCreate } from '../../interfaces/EdaCredential';
import { EdaCredentialType, EdaCredentialTypeField } from '../../interfaces/EdaCredentialType';
import { edaAPI } from '../../common/eda-utils';
import { PageFormSingleSelectEdaResource } from '../../common/PageFormSingleSelectEdaResource';
import { useCredentialTypesColumns } from '../credential-types/hooks/useCredentialTypesColumns';
import { useCredentialTypeCredentialsFilters } from '../credential-types/hooks/useCredentialTypeCredentialsFilters';
import { CredentialPluginsInputSource } from './hooks/useCredentialSecretModal';
import { PageFormSelectOrganization } from '../organizations/components/PageFormOrganizationSelect';
import { CredentialFormInputs } from './CredentialFormTypes';

export type EdaCredentialTypes = {
  [key: number]: EdaCredentialType;
};

export function PageFormSelectEdaCredentialType<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: { name: TFieldName; isRequired?: boolean; isDisabled?: string; helperText?: string }) {
  const { t } = useTranslation();
  const credentialTypeColumns = useCredentialTypesColumns();
  const credentialTypeFilters = useCredentialTypeCredentialsFilters();
  return (
    <PageFormSingleSelectEdaResource<EdaCredentialType, TFieldValues, TFieldName>
      name={props.name}
      id="credential_type_id"
      label={t('Credential type')}
      placeholder={t('Select credential type')}
      queryPlaceholder={t('Loading credential type...')}
      queryErrorText={t('Error loading credentials')}
      isRequired={props.isRequired}
      isDisabled={props.isDisabled}
      helperText={props.helperText}
      url={edaAPI`/credential-types/`}
      tableColumns={credentialTypeColumns}
      toolbarFilters={credentialTypeFilters}
    />
  );
}

// eslint-disable-next-line react/prop-types
export function CredentialInputs(props: {
  editMode: boolean;
  credentialTypes?: EdaCredentialTypes;
  setSelectedCredentialTypeId?: Dispatch<SetStateAction<number>>;
  setIsTestButtonEnabled?: (enabled: boolean) => void;
  setIsTestButtonEnabledSubForm?: (enabled: boolean) => void;
  setWatchedSubFormFields?: (fields: unknown[]) => void;
  setCredentialPluginValues?: (values: CredentialPluginsInputSource[]) => void;
  accumulatedPluginValues?: CredentialPluginsInputSource[];
  removeCredentialPluginValue?: (fieldName: string) => void;
}) {
  const { t } = useTranslation();
  const { setValue } = useFormContext();
  const {
    editMode,
    credentialTypes,
    setSelectedCredentialTypeId,
    setIsTestButtonEnabled,
    setIsTestButtonEnabledSubForm,
    setWatchedSubFormFields,
  } = props;
  const credentialTypeId = Number(
    useWatch<EdaCredentialCreate>({
      name: 'credential_type_id',
      defaultValue: undefined,
    })
  );

  useEffect(() => {
    if (setSelectedCredentialTypeId) {
      setSelectedCredentialTypeId(credentialTypeId);
    }
  }, [credentialTypeId, setSelectedCredentialTypeId]);

  const watchedRequiredFields = useWatch<{
    name: string;
    credential_type_id: number;
  }>({
    name: ['name', 'credential_type_id'],
  });

  useEffect(() => {
    const requiredFields = ['name', 'credential_type_id'];
    const verify: string[] = [];
    Object.values(watchedRequiredFields).forEach((value) => {
      if (value !== null && value !== undefined && value !== '') {
        verify.push(value as string);
      }
    });

    if (setIsTestButtonEnabled) {
      setIsTestButtonEnabled(verify.length >= requiredFields.length);
    }
  }, [watchedRequiredFields, setIsTestButtonEnabled]);

  const credentialType =
    credentialTypeId !== undefined && credentialTypes
      ? credentialTypes[credentialTypeId]
      : undefined;

  const credentialTypeFields =
    credentialType?.inputs?.fields?.filter((field) => !field.hidden) || [];
  const credentialTypeFieldNames = credentialTypeFields.map((field) => `inputs.${field.id}`);

  const watchedCredentialTypeFields = useWatch({
    name: credentialTypeFieldNames,
  });

  useEffect(() => {
    if (setWatchedSubFormFields) {
      setWatchedSubFormFields(watchedCredentialTypeFields as unknown[]);
    }
  }, [watchedCredentialTypeFields, setWatchedSubFormFields]);

  useEffect(() => {
    if (!setIsTestButtonEnabledSubForm) return;

    const requiredCredentialTypeFields = credentialType?.inputs?.required || [];
    if (!requiredCredentialTypeFields.length) {
      setIsTestButtonEnabledSubForm(true);
      return;
    }

    const requiredCredentialTypeFieldsSubForm = credentialType?.inputs?.fields.filter((field) =>
      requiredCredentialTypeFields.includes(field.id)
    );

    const verify: string[] = [];
    Object.values(watchedCredentialTypeFields).forEach((value) => {
      if (value !== null && value !== undefined && value !== '') {
        verify.push(value as string);
      }
    });

    if (requiredCredentialTypeFieldsSubForm) {
      setIsTestButtonEnabledSubForm(verify.length >= requiredCredentialTypeFieldsSubForm.length);
    }
  }, [
    watchedCredentialTypeFields,
    credentialType?.inputs?.required,
    credentialTypeFieldNames,
    setIsTestButtonEnabledSubForm,
    credentialType?.inputs?.fields,
    watchedRequiredFields,
  ]);

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
    if (editMode || !credentialTypeId) return;
    setDefaultValuesForType();
  }, [setValue, editMode, credentialTypeId, setDefaultValuesForType]);

  return (
    <>
      <PageFormTextInput<EdaCredentialCreate>
        name="name"
        data-cy="name-form-field"
        data-testid="name-form-field"
        label={t('Name')}
        placeholder={t('Enter credential name')}
        isRequired
        maxLength={150}
      />
      <PageFormTextArea<EdaCredentialCreate>
        name="description"
        data-cy="description-form-field"
        data-testid="description-form-field"
        label={t('Description')}
        placeholder={t('Enter description ')}
        maxLength={150}
      />
      <PageFormSelectOrganization<EdaCredentialCreate> name="organization_id" isRequired />
      <PageFormSelectEdaCredentialType<EdaCredentialCreate>
        name="credential_type_id"
        isRequired
        isDisabled={
          props?.editMode
            ? t(
                'You cannot change the credential type of a credential, as it may break the functionality of the resources using it.'
              )
            : undefined
        }
      />
      {credentialType !== undefined && (
        <PageFormSection title={t('Type Details')}>
          <NoAutofillDiv />
          <CredentialFormInputs
            credentialType={credentialType}
            setCredentialPluginValues={props.setCredentialPluginValues}
            accumulatedPluginValues={props.accumulatedPluginValues}
            removeCredentialPluginValue={props.removeCredentialPluginValue}
          />
        </PageFormSection>
      )}
    </>
  );
}
