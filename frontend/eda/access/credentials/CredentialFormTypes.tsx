import { PageFormCheckbox, PageFormSelect, PageFormTextInput } from '@ansible/ansible-ui-framework';
import { PageFormFileUpload } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormFileUpload';
import { PageFormSection } from '@ansible/ansible-ui-framework/PageForm/Utils/PageFormSection';
import { EdaCredentialType, EdaCredentialTypeField } from '../../interfaces/EdaCredentialType';
import { PageFormDataUrlFileUpload } from './components/PageFormDataUrlFileUpload';

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

export function CredentialFormInputs(props: { credentialType: EdaCredentialType | undefined }) {
  const fields = props?.credentialType?.inputs?.fields as EdaCredentialTypeField[];
  return fields?.map((field) => {
    return (
      !field?.hidden && (
        <CredentialFormInput
          key={field.label}
          field={field as FieldType}
          required={props.credentialType?.inputs?.required as string[]}
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
        isRequired={!!props?.required && props.required.includes(props.field.id)}
      />
    </PageFormSection>
  );
}
export function CredentialFormMultilineStringInput(props: {
  readonly field: FieldType | undefined;
  readonly required: string[];
}) {
  if (!props?.field || props.field.type !== 'string' || !props.field.multiline) {
    return;
  }
  return (
    <PageFormSection singleColumn>
      {props.field?.format && props.field.format === 'binary_base64' ? (
        <PageFormDataUrlFileUpload
          label={props.field.label}
          name={`inputs.${props.field.id}`}
          labelHelpTitle={props.field.label}
          labelHelp={props.field.help_text}
          isRequired={!!props?.required && props.required.includes(props.field.id)}
        />
      ) : (
        <PageFormFileUpload
          type="text"
          label={props.field.label}
          name={`inputs.${props.field.id}`}
          labelHelpTitle={props.field.label}
          labelHelp={props.field.help_text}
          isRequired={!!props?.required && props.required.includes(props.field.id)}
          isReadOnly={false}
          allowEditingUploadedText={true}
        />
      )}
    </PageFormSection>
  );
}
export function CredentialFormStringInput(props: {
  readonly field: FieldType | undefined;
  readonly required: string[];
}) {
  if (!props?.field) {
    return;
  }
  if (props.field.type === 'string') {
    if (props.field.multiline) {
      return <CredentialFormMultilineStringInput field={props.field} required={props?.required} />;
    } else {
      if (props.field.choices && props.field.choices.length > 0) {
        return (
          <PageFormSelect
            label={props.field.label}
            name={`inputs.${props.field.id}`}
            labelHelpTitle={props.field.label}
            labelHelp={props.field.help_text}
            options={props.field.choices.map((choice) => ({ value: choice, label: choice }))}
            isRequired={!!props?.required && props.required.includes(props.field.id)}
          />
        );
      } else {
        return (
          <PageFormTextInput
            label={props.field.label}
            name={`inputs.${props.field.id}`}
            type={props.field.secret ? 'password' : undefined}
            labelHelpTitle={props.field.label}
            labelHelp={props.field.help_text}
            isRequired={!!props?.required && props.required.includes(props.field.id)}
          />
        );
      }
    }
  }
}

export function CredentialFormInput(props: {
  readonly field: FieldType | undefined;
  readonly required: string[];
}) {
  if (!props?.field) {
    return;
  }
  if (props.field.type === 'string') {
    return <CredentialFormStringInput field={props.field} required={props?.required} />;
  }
  if (props.field.type === 'boolean') {
    return <CredentialFormBooleanInput field={props.field} required={props?.required} />;
  }
}
