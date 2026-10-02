import { InputGroup, InputGroupItem, TextArea } from '@patternfly/react-core';
import getValue from 'get-value';
import { useState } from 'react';
import { Controller, FieldPath, FieldValues, useFormContext } from 'react-hook-form';
import { useID } from '../../hooks/useID';
import { useFrameworkTranslations } from '../../useFrameworkTranslations';
import { capitalizeFirstLetter } from '../../utils/strings';
import { createFieldValidate } from '../PageFormOptionsValidation';
import { usePageFormOptionsContext } from '../PageFormOptionsContext';
import { PageFormGroup } from './PageFormGroup';
import { PageFormTextInputProps } from './PageFormTextInput';
import {
  createPatternBlurHandler,
  PasswordRevealButton,
  resolveAutoComplete,
  resolveHelperTextInvalid,
  resolveInputType,
  SelectLookupButton,
} from './PageFormTextInputHelpers';
import { useRequiredValidationRule } from './validation-hooks';

export function PageFormTextArea<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TSelection extends FieldValues = FieldValues,
>(
  props: PageFormTextInputProps<TFieldValues, TFieldName, TSelection> & {
    disableAutoResize?: boolean;
  }
) {
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
    disableAutoResize,
  } = props;

  const id = useID(props);

  const {
    control,
    setValue,
    trigger,
    formState: { isSubmitting, isValidating, defaultValues },
  } = useFormContext<TFieldValues>();

  const [showSecret, setShowSecret] = useState(false);

  const [translations] = useFrameworkTranslations();
  const required = useRequiredValidationRule(props.label, props.isRequired);

  // Auto-discover field metadata from OPTIONS context
  const fieldMetadata = usePageFormOptionsContext(name, props.optionsFieldName);

  return (
    <Controller<TFieldValues, TFieldName>
      name={name}
      control={control}
      shouldUnregister
      render={({ field: { onChange, value, name, onBlur }, fieldState: { error } }) => {
        const helperTextInvalid = resolveHelperTextInvalid(
          error?.message,
          Boolean(validate),
          isValidating,
          translations.validating
        );

        function onChangeHandler(value: string) {
          onChange(value.trimStart());
        }
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
            fullWidth
          >
            <InputGroup>
              <InputGroupItem isFill>
                <TextArea
                  id={id}
                  placeholder={placeholder}
                  onChange={(_event, value: string) => onChangeHandler(value)}
                  onBlur={createPatternBlurHandler(
                    Boolean(fieldMetadata?.pattern),
                    onBlur,
                    trigger,
                    name
                  )}
                  value={value ?? ''}
                  aria-describedby={id ? `${id}-form-group` : undefined}
                  validated={helperTextInvalid ? 'error' : undefined}
                  type={resolveInputType(type, showSecret)}
                  readOnlyVariant={isReadOnly ? 'default' : undefined}
                  isDisabled={isDisabled}
                  autoFocus={autoFocus}
                  autoComplete={resolveAutoComplete(autoComplete, type)}
                  data-cy={id}
                  data-testid={id}
                  autoResize={disableAutoResize === undefined ? true : !disableAutoResize}
                  rows={1}
                  resizeOrientation="vertical"
                />
              </InputGroupItem>
              {type === 'password' && (
                <PasswordRevealButton
                  isDisabled={isDisabled}
                  isReadOnly={isReadOnly}
                  showSecret={showSecret}
                  onToggle={() => setShowSecret(!showSecret)}
                />
              )}
              {selectTitle && (
                <SelectLookupButton
                  selectTitle={selectTitle}
                  selectOpen={selectOpen}
                  selectValue={selectValue}
                  setValue={setValue}
                  name={name}
                  isDisabled={isDisabled}
                  isSubmitting={isSubmitting}
                />
              )}
              {button}
            </InputGroup>
          </PageFormGroup>
        );
      }}
      rules={{
        required,
        validate: createFieldValidate(fieldMetadata, validate, () =>
          getValue(defaultValues as object, name)
        ),

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
            : min,

        max:
          typeof label === 'string' && (typeof max === 'number' || typeof max === 'string')
            ? {
                value: max,
                message: `${capitalizeFirstLetter(
                  label.toLocaleLowerCase()
                )} cannot be greater than ${max}.`,
              }
            : max,

        pattern,
      }}
    />
  );
}
