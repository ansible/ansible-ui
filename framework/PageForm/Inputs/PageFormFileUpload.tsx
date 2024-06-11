import { FileUpload, FileUploadProps } from '@patternfly/react-core';
import { ReactNode, useCallback, useState } from 'react';
import { Controller, FieldPathByValue, FieldValues, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useID } from '../../hooks/useID';
import { PageFormGroup, PageFormGroupProps } from './PageFormGroup';
import { useRequiredValidationRule } from './validation-hooks';

export type PageFormFileUploadProps<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPathByValue<TFieldValues, File> = FieldPathByValue<TFieldValues, File>,
> = {
  name: TFieldName;
  placeholder?: string;
  validate?: (value: File) => string | undefined;
  onInputChange?: (file: File) => Promise<void>;
  additionalHelperText?: ReactNode;
} & PageFormGroupProps &
  Omit<FileUploadProps, 'id'>;

/** PatternFly Select wrapper for use with react-hook-form */
export function PageFormFileUpload<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPathByValue<TFieldValues, File> = FieldPathByValue<TFieldValues, File>,
>(props: PageFormFileUploadProps<TFieldValues, TFieldName>) {
  const {
    label,
    labelHelpTitle,
    labelHelp,
    additionalControls,
    helperText,
    isRequired,
    validate,
    onInputChange,
  } = props;
  const { t } = useTranslation();
  const {
    control,
    formState: { isSubmitting, isValidating },
  } = useFormContext<TFieldValues>();
  const [filename, setFilename] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [inputError, setInputError] = useState<Error | undefined>(undefined);

  const handleFileInputChange = useCallback(
    (_: unknown, file: File) => {
      setFilename(file.name);
      if (onInputChange) {
        onInputChange(file).catch((error: Error) => {
          setInputError(error);
        });
      }
    },
    [onInputChange]
  );

  const handleFileReadStarted = (_fileHandle: File) => {
    setIsLoading(true);
  };
  const id = useID(props);
  const required = useRequiredValidationRule(props.label, props.isRequired);

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
          : inputError?.message
            ? inputError.message
            : undefined;
        const handleClear = (_event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
          setFilename('');
          onChange(undefined);
          if (props.onClearClick) {
            props.onClearClick(_event);
          }
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
            {props.icon && props.icon !== undefined ? (
              <div style={{ display: 'grid', gridTemplateColumns: '10fr 1fr' }}>
                <FileUpload
                  dropzoneProps={props.dropzoneProps}
                  id={id}
                  data-cy={id}
                  type={props.type || 'dataURL'}
                  value={value as string}
                  hideDefaultPreview={props.hideDefaultPreview}
                  filename={isLoading ? t('loading...') : filename}
                  filenamePlaceholder={props.placeholder}
                  onFileInputChange={handleFileInputChange}
                  onDataChange={(_event, value: string) => handleTextOrDataChange(value)}
                  onTextChange={(_event, value: string) => handleTextOrDataChange(value)}
                  onReadStarted={(_event, _fileHandle: File) => handleFileReadStarted(_fileHandle)}
                  onReadFinished={(_event, _fileHandle: File) =>
                    handleFileReadFinished(_fileHandle)
                  }
                  onClearClick={handleClear}
                  // isLoading={isLoading}
                  allowEditingUploadedText={props.allowEditingUploadedText || false}
                  // browseButtonText={t('Upload')}
                  isReadOnly={props.isReadOnly || isSubmitting}
                  validated={error || inputError ? 'error' : undefined}
                  isDisabled={props.isDisabled}
                  isClearButtonDisabled={props.isClearButtonDisabled}
                />
                {props.icon}
                {props.additionalHelperText ? props.additionalHelperText : null}
              </div>
            ) : (
              <>
                <FileUpload
                  dropzoneProps={props.dropzoneProps}
                  id={id}
                  data-cy={id}
                  type={props.type || 'dataURL'}
                  value={value as string}
                  hideDefaultPreview={props.hideDefaultPreview}
                  filename={isLoading ? t('loading...') : filename}
                  filenamePlaceholder={props.placeholder}
                  onFileInputChange={handleFileInputChange}
                  onDataChange={(_event, value: string) => handleTextOrDataChange(value)}
                  onTextChange={(_event, value: string) => handleTextOrDataChange(value)}
                  onReadStarted={(_event, _fileHandle: File) => handleFileReadStarted(_fileHandle)}
                  onReadFinished={(_event, _fileHandle: File) =>
                    handleFileReadFinished(_fileHandle)
                  }
                  onClearClick={handleClear}
                  // isLoading={isLoading}
                  allowEditingUploadedText={props.allowEditingUploadedText || false}
                  // browseButtonText={t('Upload')}
                  isReadOnly={props.isReadOnly || isSubmitting}
                  validated={error ? 'error' : undefined}
                />
                {props.additionalHelperText ? props.additionalHelperText : null}
              </>
            )}
          </PageFormGroup>
        );
      }}
      rules={{ required, validate: props.validate }}
    />
  );
}
