import { PageFormCheckbox, PageFormSelect, PageFormTextInput } from '@ansible/ansible-ui-framework';
import { PageFormFileUpload } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormFileUpload';
import { PageFormSection } from '@ansible/ansible-ui-framework/PageForm/Utils/PageFormSection';
import { useGetItem } from '@ansible/common-ui/crud/useGet';
import { Button, Tooltip } from '@patternfly/react-core';
import { KeyIcon } from '@patternfly/react-icons';
import { useCallback, useEffect, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { edaAPI } from '../../common/eda-utils';
import { EdaCredential } from '../../interfaces/EdaCredential';
import { EdaCredentialType, EdaCredentialTypeField } from '../../interfaces/EdaCredentialType';
import { PageFormDataUrlFileUpload } from './components/PageFormDataUrlFileUpload';
import {
  CredentialPluginsInputSource,
  useCredentialPluginsModal,
} from './hooks/useCredentialSecretModal';

export function isFieldRequired(required: string[] | undefined, fieldId: string): boolean {
  return !!required && required.includes(fieldId);
}

export interface OptionsResponse {
  actions: {
    PUT: Record<string, FieldType>;
  };
}

export type FieldType = IFieldTypeString | IFieldTypeBoolean;

interface IFieldTypeBase {
  id: string;
  label: string;
  help_text?: string;
}

interface IFieldTypeString extends IFieldTypeBase {
  type: 'string';
  secret: boolean;
  multiline: boolean;
  choices: string[];
  default?: string;
  format?: string;
}

interface IFieldTypeBoolean extends IFieldTypeBase {
  type: 'boolean';
  default?: boolean;
  secret: boolean;
}

export function CredentialFormInputs(props: {
  credentialType: EdaCredentialType | undefined;
  setCredentialPluginValues?: (values: CredentialPluginsInputSource[]) => void;
  accumulatedPluginValues?: CredentialPluginsInputSource[];
  removeCredentialPluginValue?: (fieldName: string) => void;
}) {
  const fields = props?.credentialType?.inputs?.fields as EdaCredentialTypeField[];
  const kind = props?.credentialType?.kind;
  return fields?.map((field) => {
    return (
      !field?.hidden && (
        <CredentialFormInput
          key={field.label}
          field={field as FieldType}
          kind={kind}
          required={props.credentialType?.inputs?.required as string[]}
          setCredentialPluginValues={props.setCredentialPluginValues}
          accumulatedPluginValues={props.accumulatedPluginValues}
          removeCredentialPluginValue={props.removeCredentialPluginValue}
        />
      )
    );
  });
}

export function CredentialFormBooleanInput(props: {
  readonly field: FieldType | undefined;
  readonly required: string[];
}) {
  if (!props?.field) {
    return;
  }
  return (
    <PageFormSection singleColumn>
      <PageFormCheckbox
        label={props.field.label}
        name={`inputs.${props.field.id}`}
        labelHelpTitle={props.field.label}
        labelHelp={props.field.help_text}
        isRequired={isFieldRequired(props.required, props.field.id)}
      />
    </PageFormSection>
  );
}
export function CredentialFormMultilineStringInput(props: {
  readonly field: FieldType | undefined;
  readonly required: string[];
  readonly kind?: string;
  readonly onSecretModalToggle?: () => void;
  readonly accumulatedPluginValues?: CredentialPluginsInputSource[];
  readonly removeCredentialPluginValue?: (fieldName: string) => void;
}) {
  const { t } = useTranslation();
  const { setValue, clearErrors } = useFormContext();

  // Move hooks before early return
  const sourceCredentialId = props.accumulatedPluginValues?.filter(
    (cp) => cp.input_field_name === props.field?.id
  )[0]?.source_credential;

  const { data: sourceCredential } = useGetItem<EdaCredential>(
    edaAPI`/eda-credentials/`,
    sourceCredentialId
  );

  const renderFieldValue = useCallback((): string => {
    let placeholder = 'Drag a file here or browse to upload';
    props.accumulatedPluginValues?.forEach((cp) => {
      if (cp.input_field_name === props.field?.id && sourceCredential) {
        placeholder = t(
          `Value is managed by ${sourceCredential.credential_type?.namespace || 'external'}: ${
            sourceCredential.name
          }`
        );
      }
    });
    return placeholder;
  }, [props.accumulatedPluginValues, sourceCredential, t, props.field?.id]);

  useEffect(() => {
    // if field id matches accumulatedPluginValues input_field_name, set value to kind: credential name
    if (
      props.field &&
      props.accumulatedPluginValues?.some((cp) => cp.input_field_name === props.field?.id)
    ) {
      setValue(`inputs.${props.field.id}`, renderFieldValue(), { shouldDirty: true });
    }
  }, [setValue, props.accumulatedPluginValues, renderFieldValue, props.field]);

  if (!props?.field || props.field.type !== 'string' || !props.field.multiline) {
    return;
  }

  const field = props.field;

  const handleIsDisabled = (): boolean => {
    return props.accumulatedPluginValues?.some((cp) => cp.input_field_name === field.id) || false;
  };

  const handleHelperText = (): string => {
    const hasExternalCredential = props.accumulatedPluginValues?.some(
      (cp) => cp.input_field_name === field.id
    );
    return hasExternalCredential
      ? t(
          'This field will be retrieved from an external secret management system using the specified credential.'
        )
      : '';
  };

  const onClear = () => {
    setValue(`inputs.${field.id}`, '', { shouldDirty: false });
    clearErrors(`inputs.${field.id}`);
    if (props.removeCredentialPluginValue) {
      props.removeCredentialPluginValue(field.id);
    }
  };

  const secretManagementButton =
    props.kind !== 'external' ? (
      <div style={{ display: 'flex', justifyContent: 'flex-start', width: 'fit-content' }}>
        <Button
          data-cy="secret-management-input"
          data-testid="secret-management-input"
          icon={<KeyIcon />}
          variant="control"
          onClick={props.onSecretModalToggle}
        />
      </div>
    ) : undefined;

  return (
    <PageFormSection singleColumn>
      {field?.format && field.format === 'binary_base64' ? (
        <PageFormDataUrlFileUpload
          label={field.label}
          name={`inputs.${field.id}`}
          labelHelpTitle={field.label}
          labelHelp={field.help_text}
          isRequired={isFieldRequired(props.required, field.id)}
          helperText={handleHelperText()}
        />
      ) : (
        <PageFormFileUpload
          onClearClick={onClear}
          type="text"
          label={field.label}
          name={`inputs.${field.id}`}
          labelHelpTitle={field.label}
          labelHelp={field.help_text}
          helperText={handleHelperText()}
          isRequired={isFieldRequired(props.required, field.id)}
          isReadOnly={handleIsDisabled()}
          allowEditingUploadedText={true}
          placeholder={renderFieldValue()}
          icon={secretManagementButton}
        />
      )}
    </PageFormSection>
  );
}
function CredentialFormSelectInput(props: { field: IFieldTypeString; required: string[] }) {
  return (
    <PageFormSelect
      label={props.field.label}
      name={`inputs.${props.field.id}`}
      labelHelpTitle={props.field.label}
      labelHelp={props.field.help_text}
      options={props.field.choices.map((choice: string) => ({ value: choice, label: choice }))}
      isRequired={isFieldRequired(props.required, props.field.id)}
    />
  );
}

function CredentialFormTextInputWithButton(props: {
  field: IFieldTypeString;
  required: string[];
  kind: string | undefined;
  onSecretModalToggle: () => void;
  accumulatedPluginValues?: CredentialPluginsInputSource[];
  removeCredentialPluginValue?: (fieldName: string) => void;
}) {
  const { t } = useTranslation();
  const { setValue } = useFormContext();

  const useGetSourceCredential = (id: number | undefined) => {
    const { data } = useGetItem<EdaCredential>(edaAPI`/eda-credentials/`, id);
    return data;
  };

  const sourceCredential = useGetSourceCredential(
    props.accumulatedPluginValues?.filter((cp) => cp.input_field_name === props.field.id)[0]
      ?.source_credential
  );

  const getExternalCredentialInfo = useCallback(() => {
    if (!props.accumulatedPluginValues) {
      return {
        hasExternalCredential: false,
        managedByText: '',
      };
    }

    const pluginValue = props.accumulatedPluginValues.find(
      (cp) => cp.input_field_name === props.field.id
    );

    if (pluginValue && sourceCredential) {
      return {
        hasExternalCredential: true,
        managedByText: t(
          `Value is managed by ${sourceCredential.credential_type?.namespace || 'external'}: ${sourceCredential.name}`
        ),
      };
    }

    return {
      hasExternalCredential: !!pluginValue,
      managedByText: '',
    };
  }, [props.accumulatedPluginValues, props.field.id, sourceCredential, t]);

  const externalCredentialInfo = getExternalCredentialInfo();

  const handleClearField = () => {
    if (props.removeCredentialPluginValue) {
      props.removeCredentialPluginValue(props.field.id);
      setValue(`inputs.${props.field.id}`, '');
    }
  };

  const helperText = useMemo((): string | undefined => {
    if (externalCredentialInfo.hasExternalCredential) {
      return t(
        'This field will be retrieved from an external secret management system using the specified credential.'
      );
    }

    return undefined;
  }, [externalCredentialInfo.hasExternalCredential, t]);

  const isDisabled = externalCredentialInfo.hasExternalCredential;

  useEffect(() => {
    if (externalCredentialInfo.hasExternalCredential && externalCredentialInfo.managedByText) {
      setValue(`inputs.${props.field.id}`, externalCredentialInfo.managedByText);
    }
  }, [
    externalCredentialInfo.hasExternalCredential,
    externalCredentialInfo.managedByText,
    setValue,
    props.field.id,
  ]);

  return (
    <PageFormTextInput
      label={props.field.label}
      name={`inputs.${props.field.id}`}
      type={props.field.secret ? 'password' : undefined}
      placeholder={externalCredentialInfo.managedByText || undefined}
      helperText={helperText}
      labelHelpTitle={props.field.label}
      labelHelp={props.field.help_text}
      isRequired={
        !externalCredentialInfo.hasExternalCredential &&
        isFieldRequired(props.required, props.field.id)
      }
      isDisabled={isDisabled}
      button={
        props.kind !== 'external' ? (
          <>
            <Tooltip
              flipBehavior={['top', 'bottom']}
              content={t('Populate field from an external secret management system')}
            >
              <Button
                data-cy="secret-management-input"
                data-testid="secret-management-input"
                variant="control"
                icon={<KeyIcon />}
                onClick={props.onSecretModalToggle}
              />
            </Tooltip>
            {externalCredentialInfo.hasExternalCredential && (
              <Button
                data-cy="clear-secret-management-input"
                data-testid="clear-secret-management-input"
                variant="control"
                onClick={handleClearField}
              >
                {t('Clear')}
              </Button>
            )}
          </>
        ) : undefined
      }
    />
  );
}

export function CredentialFormStringInput(props: {
  readonly field: FieldType | undefined;
  readonly kind: string | undefined;
  readonly required: string[];
  readonly setCredentialPluginValues?: (values: CredentialPluginsInputSource[]) => void;
  readonly accumulatedPluginValues?: CredentialPluginsInputSource[];
  readonly removeCredentialPluginValue?: (fieldName: string) => void;
}) {
  const openCredentialPluginsModal = useCredentialPluginsModal();

  if (!props?.field || props.field.type !== 'string') {
    return;
  }

  const handleSecretModalToggle = () => {
    if (props.field && props.setCredentialPluginValues) {
      openCredentialPluginsModal({
        field: props.field as EdaCredentialTypeField,
        setCredentialPluginValues: props.setCredentialPluginValues,
        accumulatedPluginValues: props.accumulatedPluginValues,
      });
    }
  };

  if (props.field.multiline) {
    return (
      <CredentialFormMultilineStringInput
        field={props.field}
        required={props.required}
        kind={props.kind}
        onSecretModalToggle={handleSecretModalToggle}
        accumulatedPluginValues={props.accumulatedPluginValues}
        removeCredentialPluginValue={props.removeCredentialPluginValue}
      />
    );
  }

  if (props.field.choices && props.field.choices.length > 0) {
    return <CredentialFormSelectInput field={props.field} required={props.required} />;
  }

  return (
    <CredentialFormTextInputWithButton
      field={props.field}
      required={props.required}
      kind={props.kind}
      onSecretModalToggle={handleSecretModalToggle}
      accumulatedPluginValues={props.accumulatedPluginValues}
      removeCredentialPluginValue={props.removeCredentialPluginValue}
    />
  );
}

export function CredentialFormInput(props: {
  readonly field: FieldType | undefined;
  readonly kind: string | undefined;
  readonly required: string[];
  readonly setCredentialPluginValues?: (values: CredentialPluginsInputSource[]) => void;
  readonly accumulatedPluginValues?: CredentialPluginsInputSource[];
  readonly removeCredentialPluginValue?: (fieldName: string) => void;
}) {
  if (!props?.field) {
    return;
  }
  if (props.field.type === 'string') {
    return (
      <CredentialFormStringInput
        field={props.field}
        kind={props?.kind}
        required={props?.required}
        setCredentialPluginValues={props.setCredentialPluginValues}
        accumulatedPluginValues={props.accumulatedPluginValues}
        removeCredentialPluginValue={props.removeCredentialPluginValue}
      />
    );
  }
  if (props.field.type === 'boolean') {
    return <CredentialFormBooleanInput field={props.field} required={props?.required} />;
  }
}
