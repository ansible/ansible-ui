import React, { useCallback, useState } from 'react';
import { FileUpload, FileUploadProps } from '@patternfly/react-core';
import { Controller, useFormContext } from 'react-hook-form';
import { PageFormGroup, PageFormGroupProps } from './PageFormGroup';
import { useTranslation } from 'react-i18next';

export type PageFormFileUploadProps = {
  name: string;
  placeholder?: string;
} & PageFormGroupProps &
  Omit<FileUploadProps, 'id'>;

/** PatternFly Select wrapper for use with react-hook-form */
export function PageFormFileUpload(props: PageFormFileUploadProps) {
  const { t } = useTranslation();
  const {
    control,
    formState: { isSubmitting },
  } = useFormContext();
  const [filename, setFilename] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const handleFileInputChange = useCallback((_: unknown, file: File) => setFilename(file.name), []);
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
        const handleTextOrDataChange = (value: string) => {
          if (props.type === 'text') {
            onChange(value);
          }
        };
        return (
          <PageFormGroup
            {...props}
            helperTextInvalid={
              error?.type === 'required'
                ? typeof props.label === 'string'
                  ? t(`${props.label} is required`)
                  : t('Required')
                : error?.message
            }
          >
            <FileUpload
              id={`file-upload-${props.name}`}
              data-cy={`file-upload-${props.name}`}
              type={props.type || 'dataURL'}
              value={value as string}
              hideDefaultPreview={props.hideDefaultPreview}
              filename={isLoading ? t('loading...') : filename}
              filenamePlaceholder={props.placeholder}
              onFileInputChange={handleFileInputChange}
              onDataChange={(_event, value: string) => handleTextOrDataChange(value)}
              // onTextChange={handleTextOrDataChange}
              onReadStarted={(_event, _fileHandle: File) => handleFileReadStarted(_fileHandle)}
              onReadFinished={(_event, _fileHandle: File) => handleFileReadFinished(_fileHandle)}
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
