import { Button, InputGroup, InputGroupItem, TextArea } from '@patternfly/react-core';
import { EyeIcon, EyeSlashIcon, SearchIcon } from '@patternfly/react-icons';
import { useState } from 'react';
import { Controller, FieldPath, FieldValues, PathValue, useFormContext } from 'react-hook-form';
import { useID } from '../../hooks/useID';
import { useFrameworkTranslations } from '../../useFrameworkTranslations';
import { capitalizeFirstLetter } from '../../utils/strings';
import { PageFormGroup } from './PageFormGroup';
import { PageFormTextInputProps } from './PageFormTextInput';

export function PageFormTextArea<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TSelection extends FieldValues = FieldValues,
>(props: PageFormTextInputProps<TFieldValues, TFieldName, TSelection>) {
  const {
    type,
    name,
    label,
    labelHelpTitle,
    labelHelp,
    additionalControls,
    placeholder,
    button,
    helperText,
    isDisabled,
    isReadOnly,
    isRequired,
    validate,
    minLength,
    maxLength,
    min,
    max,
    pattern,
    selectTitle,
    selectOpen,
    selectValue,
    autoFocus,
    autoComplete,
  } = props;

  const id = useID(props);

  const {
    control,
    setValue,
    formState: { isSubmitting, isValidating },
  } = useFormContext<TFieldValues>();

  const [showSecret, setShowSecret] = useState(false);

  const [translations] = useFrameworkTranslations();

  return (
    <Controller<TFieldValues, TFieldName>
      name={name}
      control={control}
      shouldUnregister
      render={({ field: { onChange, value, name }, fieldState: { error } }) => {
        const helperTextInvalid = error?.message
          ? validate && isValidating
            ? translations.validating
            : error?.message
          : undefined;

        function onChangeHandler(value: string) {
          onChange(value.trimStart());
        }
        return (
          <PageFormGroup
            fieldId={id}
            label={label}
            labelHelpTitle={labelHelpTitle}
            labelHelp={labelHelp}
            additionalControls={additionalControls}
            helperText={helperText}
            helperTextInvalid={helperTextInvalid}
            isRequired={isRequired}
          >
            <InputGroup>
              <InputGroupItem isFill>
                <TextArea
                  id={id}
                  placeholder={placeholder}
                  onChange={(_event, value: string) => onChangeHandler(value)}
                  value={value ?? ''}
                  aria-describedby={id ? `${id}-form-group` : undefined}
                  validated={helperTextInvalid ? 'error' : undefined}
                  type={type === 'password' ? (showSecret ? 'text' : 'password') : type}
                  readOnlyVariant={isReadOnly ? 'default' : undefined}
                  isDisabled={isDisabled}
                  autoFocus={autoFocus}
                  autoComplete={autoComplete || 'off'}
                  data-cy={id}
                />
              </InputGroupItem>
              {type === 'password' && (
                <Button
                  variant="control"
                  onClick={() => setShowSecret(!showSecret)}
                  isDisabled={isDisabled || isReadOnly}
                >
                  {showSecret ? <EyeIcon /> : <EyeSlashIcon />}
                </Button>
              )}
              {selectTitle && (
                <Button
                  ouiaId={`lookup-${name}-button`}
                  variant="control"
                  onClick={() =>
                    selectOpen?.((item: TSelection) => {
                      if (selectValue) {
                        const value = selectValue(item);
                        setValue(name, value as unknown as PathValue<TFieldValues, TFieldName>, {
                          shouldValidate: true,
                        });
                      }
                    }, selectTitle)
                  }
                  aria-label="Options menu"
                  isDisabled={isDisabled || isSubmitting}
                >
                  <SearchIcon />
                </Button>
              )}
              {button && button}
            </InputGroup>
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

        validate,

        minLength:
          typeof label === 'string' && typeof minLength === 'number'
            ? {
                value: minLength,
                message: `${capitalizeFirstLetter(
                  label.toLocaleLowerCase()
                )} must be at least ${minLength} characters.`,
              }
            : minLength,

        maxLength:
          typeof label === 'string' && typeof maxLength === 'number'
            ? {
                value: maxLength,
                message: `${capitalizeFirstLetter(
                  label.toLocaleLowerCase()
                )} cannot be greater than ${maxLength} characters.`,
              }
            : maxLength,

        min:
          typeof label === 'string' && (typeof min === 'number' || typeof min === 'string')
            ? {
                value: min,
                message: `${capitalizeFirstLetter(
                  label.toLocaleLowerCase()
                )} must be less than ${min}.`,
              }
            : minLength,

        max:
          typeof label === 'string' && (typeof max === 'number' || typeof max === 'string')
            ? {
                value: max,
                message: `${capitalizeFirstLetter(
                  label.toLocaleLowerCase()
                )} cannot be greater than ${max}.`,
              }
            : minLength,

        pattern,
      }}
    />
  );
}
