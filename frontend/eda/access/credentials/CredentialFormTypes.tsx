import { PageFormCheckbox, PageFormSelect, PageFormTextInput } from '../../../../framework';
import { PageFormSection } from '../../../../framework/PageForm/Utils/PageFormSection';
import { EdaCredentialType, EdaCredentialTypeField } from '../../interfaces/EdaCredentialType';
import { PageFormFileUpload } from '../../../../framework/PageForm/Inputs/PageFormFileUpload';

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
      <CredentialFormInput
        key={field.label}
        field={field as FieldType}
        required={props.credentialType?.inputs?.required as string[]}
      />
    );
  });
}
export function CredentialFormInput(props: { field: FieldType | undefined; required: string[] }) {
  if (!props?.field) {
    return;
  }
  if (props.field.type === 'string') {
    if (props.field.multiline) {
      return (
        <PageFormSection singleColumn>
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
        </PageFormSection>
      );
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
  if (props.field.type === 'boolean') {
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
}
