import { Button } from '@patternfly/react-core';
import { KeyIcon } from '@patternfly/react-icons';
import { PageFormFileUpload } from '../../../../../framework/PageForm/Inputs/PageFormFileUpload';
import { CredentialInputField, CredentialType } from '../../../interfaces/CredentialType';

export function CredentialMultilineInput({
  field,
  requiredFields,
  kind,
}: {
  field: CredentialInputField;
  requiredFields: CredentialType['inputs']['required'];
  kind: CredentialType['kind'];
}) {
  //TODO: Hook up Secret Management Wizard when user clicks the key icon
  return (
    <>
      <PageFormFileUpload
        key={field.id}
        type="text"
        label={field.label}
        name={`${field.id}`}
        labelHelpTitle={field.label}
        labelHelp={field.help_text}
        isRequired={requiredFields.includes(field.id)}
        isReadOnly={false}
        allowEditingUploadedText={true}
        icon={
          kind !== 'external' ? (
            <Button
              icon={<KeyIcon />}
              variant="plain"
              style={{
                border: '1px solid var(--pf-v5-global--BorderColor--300)',
              }}
            />
          ) : undefined
        }
      />
    </>
  );
}
