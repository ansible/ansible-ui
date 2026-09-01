import { Button, InputGroup, InputGroupItem, TextArea } from '@patternfly/react-core';
import { EyeIcon, EyeSlashIcon, SearchIcon } from '@patternfly/react-icons';
import getValue from 'get-value';
import { useState } from 'react';
import { Controller, FieldPath, FieldValues, PathValue, useFormContext } from 'react-hook-form';
import { useID } from '../../hooks/useID';
import { useFrameworkTranslations } from '../../useFrameworkTranslations';
import { capitalizeFirstLetter } from '../../utils/strings';
import { usePageFormOptionsContext } from '../PageFormOptionsContext';
import { PageFormGroup } from './PageFormGroup';
import { PageFormTextInputProps } from './PageFormTextInput';
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
  const fieldMetadata = usePageFormOptionsContext(name);

  return (
    <Controller<TFieldValues, TFieldName>
      name={name}
      control={control}
      shouldUnregister
      render={({ field: { onChange, value, name, onBlur }, fieldState: { error } }) => {
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
                  onBlur={
                    fieldMetadata?.pattern
                      ? async () => {
                          onBlur();
                          // Manually trigger validation for this field
                          await trigger(name);
                        }
                      : onBlur
                  }
                  value={value ?? ''}
                  aria-describedby={id ? `${id}-form-group` : undefined}
                  validated={helperTextInvalid ? 'error' : undefined}
                  type={type === 'password' ? (showSecret ? 'text' : 'password') : type}
                  readOnlyVariant={isReadOnly ? 'default' : undefined}
                  isDisabled={isDisabled}
                  autoFocus={autoFocus}
                  autoComplete={autoComplete || (type === 'password' ? 'new-password' : 'off')}
                  data-cy={id}
                  data-testid={id}
                  autoResize={disableAutoResize === undefined ? true : !disableAutoResize}
                  rows={1}
                  resizeOrientation="vertical"
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
                  icon={<SearchIcon />}
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
                ></Button>
              )}
              {button}
            </InputGroup>
          </PageFormGroup>
        );
      }}
      rules={{
        required,
        validate: (value, formValues) => {
          // Get the default value for this field to check if it's dirty
          const defaultValue = getValue(defaultValues as object, name) as typeof value;
          const isFieldDirty = value !== defaultValue;

          // OPTIONS pattern validation (fires first, only when isDirty)
          if (fieldMetadata?.pattern && isFieldDirty) {
            // Apply pattern validation
            if (value && typeof value === 'string') {
              // Use flags if provided (e.g., 'u' for Unicode support)
              const regex = new RegExp(fieldMetadata.pattern, fieldMetadata.flags);
              if (!regex.test(value)) {
                return (
                  fieldMetadata.pattern_description ||
                  `This field does not match the required pattern.`
                );
              }
            }
          }

          // User-provided validate functions (fire after OPTIONS pattern)
          if (validate) {
            if (typeof validate === 'function') {
              return validate(value, formValues);
            } else if (typeof validate === 'object') {
              // Execute all validation functions in the object
              for (const [_key, validationFn] of Object.entries(validate)) {
                const result = validationFn(value, formValues);
                if (result !== true) {
                  return result;
                }
              }
            }
          }

          return true;
        },

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
