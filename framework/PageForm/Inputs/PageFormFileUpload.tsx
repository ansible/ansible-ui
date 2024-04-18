import { FileUpload, FileUploadProps } from '@patternfly/react-core';
import { useCallback, useState } from 'react';
import { Controller, FieldPathByValue, FieldValues, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useID } from '../../hooks/useID';
import { capitalizeFirstLetter } from '../../utils/strings';
import { PageFormGroup, PageFormGroupProps } from './PageFormGroup';

export type PageFormFileUploadProps<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPathByValue<TFieldValues, File> = FieldPathByValue<TFieldValues, File>,
> = {
  name: TFieldName;
  placeholder?: string;
  validate?: (value: File) => string | undefined;
} & PageFormGroupProps &
  Omit<FileUploadProps, 'id'>;

/** PatternFly Select wrapper for use with react-hook-form */
export function PageFormFileUpload<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPathByValue<TFieldValues, File> = FieldPathByValue<TFieldValues, File>,
>(props: PageFormFileUploadProps<TFieldValues, TFieldName>) {
  const { label, labelHelpTitle, labelHelp, additionalControls, helperText, isRequired, validate } =
    props;
  const { t } = useTranslation();
  const {
    control,
    formState: { isSubmitting, isValidating },
  } = useFormContext<TFieldValues>();
  const [filename, setFilename] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileInputChange = useCallback((_: unknown, file: File) => setFilename(file.name), []);
  const handleFileReadStarted = (_fileHandle: File) => {
    setIsLoading(true);
  };
  const id = useID(props);

  return (
    <Controller
      name={props.name}
      control={control}
      shouldUnregister
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const helperTextInvalid = error?.message
          ? validate && isValidating
            ? t('Validating...')
            : error?.message
          : undefined;
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
            fieldId={id}
            label={label}
            labelHelpTitle={labelHelpTitle ?? label}
            labelHelp={labelHelp}
            additionalControls={additionalControls}
            helperText={helperText}
            helperTextInvalid={helperTextInvalid}
            isRequired={isRequired}
          >
            <FileUpload
              id={id}
              data-cy={id}
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
      rules={{
        required:
          typeof label === 'string' && isRequired === true
            ? {
                value: true,
                message: `${capitalizeFirstLetter(label.toLocaleLowerCase())} is required.`,
              }
            : undefined,
        validate: props.validate,
      }}
    />
  );
}
