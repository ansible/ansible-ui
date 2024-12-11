import { PageFormFileUpload } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormFileUpload';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

export function PageFormDataUrlFileUpload(props: {
  readonly name: string;
  readonly label: string;
  readonly helperText?: string;
  readonly labelHelp?: string;
  readonly labelHelpTitle?: string;
  readonly isRequired: boolean;
}) {
  const { setValue } = useFormContext();
  const [uploadError, setUploadError] = useState<Error | undefined>(undefined);
  const onClear = () => {
    setUploadError(undefined);
    setValue(props.name, '');
    setValue(`${props.name}`, '');
  };

  return (
    <PageFormFileUpload
      type={'dataURL'}
      onClearClick={onClear}
      key={`${props.name}`}
      name={`${props.name}`}
      fieldId={`${props.name}`}
      label={props?.label}
      labelHelp={props?.labelHelp}
      labelHelpTitle={props?.labelHelpTitle}
      helperText={props?.helperText}
      validated={uploadError ? 'error' : 'default'}
      required={props?.isRequired}
      onInputChange={async (file) => {
        try {
          const data = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(file);
          });
          setValue(props.name, (data as string).split(',').pop());
        } catch (error) {
          setUploadError(error as Error);
        }
      }}
    />
  );
}
