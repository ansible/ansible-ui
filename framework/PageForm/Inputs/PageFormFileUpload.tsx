import { FileUpload } from '@patternfly/react-core';
import { useCallback, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { PageFormGroup, PageFormGroupProps } from './PageFormGroup';

export type PageFormFileUploadProps = {
  name: string;
  isReadOnly?: boolean;
  placeholder?: string;
} & PageFormGroupProps;

/** PatternFly Select wrapper for use with react-hook-form */
export function PageFormFileUpload(props: PageFormFileUploadProps) {
  const {
    control,
    formState: { isSubmitting },
  } = useFormContext();
  const [filename, setFilename] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const handleFileInputChange = useCallback((_, file: File) => setFilename(file.name), []);
  const handleFileReadStarted = (_fileHandle: File) => {
    setIsLoading(true);
  };
  return (
    <Controller
      name={props.name}
      control={control}
      shouldUnregister
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const handleClear = (_event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
          setFilename('');
          onChange(undefined);
        };
        const handleFileReadFinished = (_fileHandle: File) => {
          setIsLoading(false);
          onChange(_fileHandle);
        };
        // const handleTextOrDataChange = (value: string) => {
        //   onChange(value)
        // }
        return (
          <PageFormGroup
            {...props}
            helperTextInvalid={
              error?.type === 'required'
                ? typeof props.label === 'string'
                  ? `${props.label} is required`
                  : 'Required'
                : error?.message
            }
          >
            <FileUpload
              id="file-upload"
              type="dataURL"
              value={value as string}
              filename={isLoading ? 'loading...' : filename}
              filenamePlaceholder={props.placeholder}
              onFileInputChange={handleFileInputChange}
              // onDataChange={handleTextOrDataChange}
              // onTextChange={handleTextOrDataChange}
              onReadStarted={handleFileReadStarted}
              onReadFinished={handleFileReadFinished}
              onClearClick={handleClear}
              // isLoading={isLoading}
              allowEditingUploadedText={false}
              // browseButtonText={t('Upload')}
              isReadOnly={props.isReadOnly || isSubmitting}
              validated={error ? 'error' : undefined}
            />
          </PageFormGroup>
        );
      }}
    />
  );
}
