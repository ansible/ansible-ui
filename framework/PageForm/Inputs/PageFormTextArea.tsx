import { InputGroup, InputGroupItem, TextArea, TextAreaProps } from '@patternfly/react-core';
import { getByPath } from '../../utils/getByPath';
import { useLayoutEffect, useRef, useState } from 'react';
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

/**
 * PatternFly TextArea autoResize only runs on mount and onChange, not when a
 * controlled value is updated later (e.g. survey defaults via form reset).
 * Keep rows in sync with the value and recompute the wrapper height so all
 * lines stay visible; vertical resize remains enabled for manual growth.
 */
function AutoGrowingTextArea({
  value,
  autoResizeEnabled,
  ...textAreaProps
}: Omit<TextAreaProps, 'ref' | 'rows' | 'autoResize' | 'resizeOrientation'> & {
  value: string;
  autoResizeEnabled: boolean;
}) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const rows = Math.max(1, String(value ?? '').split(/\r?\n/).length);

  useLayoutEffect(() => {
    if (!autoResizeEnabled) {
      return;
    }
    const field = textAreaRef.current;
    const parent = field?.parentElement;
    if (!field || !parent) {
      return;
    }
    parent.style.setProperty('height', 'inherit');
    const computed = window.getComputedStyle(field);
    const parentComputed = window.getComputedStyle(parent);
    const height =
      parseInt(computed.getPropertyValue('border-top-width'), 10) +
      field.scrollHeight +
      parseInt(computed.getPropertyValue('border-bottom-width'), 10) +
      parseInt(parentComputed.getPropertyValue('padding-top'), 10) +
      parseInt(parentComputed.getPropertyValue('padding-bottom'), 10);
    if (Number.isFinite(height) && height > 0) {
      parent.style.setProperty('height', `${height}px`);
    }
  }, [value, autoResizeEnabled, rows]);

  return (
    <TextArea
      {...textAreaProps}
      ref={textAreaRef}
      value={value}
      autoResize={autoResizeEnabled}
      rows={rows}
      resizeOrientation="vertical"
    />
  );
}

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
                <AutoGrowingTextArea
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
                  autoResizeEnabled={disableAutoResize === undefined ? true : !disableAutoResize}
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
          getByPath(defaultValues as object, name)
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
