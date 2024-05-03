import { Button } from '@patternfly/react-core';
import { KeyIcon } from '@patternfly/react-icons';
import { PageFormFileUpload } from '../../../../../framework/PageForm/Inputs/PageFormFileUpload';
import { CredentialInputField, CredentialType } from '../../../interfaces/CredentialType';

export function CredentialMultilineInput({
  field,
  requiredFields,
  kind,
  handleModalToggle,
}: {
  field: CredentialInputField;
  requiredFields: CredentialType['inputs']['required'];
  kind: CredentialType['kind'];
  handleModalToggle: () => void;
}) {
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
            <Button icon={<KeyIcon />} variant="control" onClick={handleModalToggle} />
          ) : undefined
        }
      />
    </>
  );
}
