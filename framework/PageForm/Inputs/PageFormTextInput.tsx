import { Button } from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import { ReactElement, ReactNode } from 'react';
import {
  Controller,
  FieldPath,
  FieldPathValue,
  FieldValues,
  PathValue,
  Validate,
  ValidationRule,
  useFormContext,
} from 'react-hook-form';
import { useFrameworkTranslations } from '../../useFrameworkTranslations';
import { capitalizeFirstLetter } from '../../utils/strings';
import { FormGroupTextInput } from './FormGroupTextInput';

export type PageFormTextInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TSelection extends FieldValues = FieldValues
> = {
  /**
   * The id attribute specifies a unique id for an HTML element. The value of the id attribute must be unique within the HTML document.
   *
   * The id attribute is used to point to a specific style declaration in a style sheet. It is also used by JavaScript to access and manipulate the element with the specific id.
   */
  id?: string;

  /**
   * The name attribute specifies the name of an <input> element.
   *
   * The name attribute is used to reference elements in a JavaScript, or to reference form data after a form is submitted.
   *
   * Note: Only form elements with a name attribute will have their values passed when submitting a form.
   */
  name: TFieldName;

  /**
   * The type attribute specifies the type of <input> element to display.
   *
   * If the type attribute is not specified, the default type is "text".
   */
  type?:
    | 'text'
    | 'date'
    | 'datetime-local'
    | 'email'
    | 'month'
    | 'number'
    | 'password'
    | 'search'
    | 'tel'
    | 'time'
    | 'url';

  /**
   * The <label> tag defines a label for several elements.
   *
   * Proper use of labels with the elements will benefit:
   * - Screen reader users (will read out loud the label, when the user is focused on the element)
   * - Users who have difficulty clicking on very small regions (such as checkboxes) - because when a user clicks the text within the <label> element, it toggles the input (this increases the hit area).
   */
  label?: string;

  // TODO - convert this to `help: ReactNode` and use the `HelperText` component
  labelHelpTitle?: string;
  labelHelp?: ReactNode;

  // Additional label information displayed after the label.
  additionalControls?: ReactNode;

  /**
   * The placeholder attribute specifies a short hint that describes the expected value of an input field (e.g. a sample value or a short description of the expected format).
   *
   * The short hint is displayed in the input field before the user enters a value.
   *
   * Note: The placeholder attribute works with the following input types: text, search, url, tel, email, and password.
   */
  placeholder?: string;

  /**
   * When specified the input will be rendered with a button to the right of the input using a InputGroup.
   *
   * An input group groups multiple related controls or inputs together so they appear as one control.
   */
  button?: ReactElement;

  /**
   * When present, it specifies that the <input> element should be disabled.
   *
   * A disabled input element is unusable and un-clickable.
   *
   * The disabled attribute can be set to keep a user from using the <input> element until some other condition has been met (like selecting a checkbox, etc.). Then, a JavaScript could remove the disabled value, and make the <input> element usable.
   */
  isDisabled?: boolean;

  /**
   * The readonly attribute is a boolean attribute.
   *
   * When present, it specifies that an input field is read-only.
   *
   * A read-only input field cannot be modified (however, a user can tab to it, highlight it, and copy the text from it).
   *
   * The readonly attribute can be set to keep a user from changing the value until some other conditions have been met (like selecting a checkbox, etc.). Then, a JavaScript can remove the readonly value, and make the input field editable.
   *
   * Note: A form will still submit an input field that is readonly, but will not submit an input field that is disabled!
   */
  isReadOnly?: boolean;

  /**
   * The required attribute is a boolean attribute.
   *
   * When present, it specifies that an input field must be filled out before submitting the form.
   *
   * Note: The required attribute works with the following input types: text, search, url, tel, email, password, date pickers, number, checkbox, radio, and file.
   */
  isRequired?: boolean;

  /**
   * You can pass a callback function as the argument to validate, or you can pass an object of callback functions to validate all of them. This function will be executed on its own without depending on other validation rules included in the required attribute.
   *
   * Note: for object or array input data, it's recommended to use the validate function for validation as the other rules mostly apply to string, string[], number and boolean data types.
   */
  validate?: Validate<string, TFieldValues> | Record<string, Validate<string, TFieldValues>>;

  /**
   * The minlength attribute specifies the minimum number of characters required in an input field.
   *
   * Note: The minlength attribute can be used with input type: text, search, url, tel, email, and password.
   */
  minLength?: number | ValidationRule<number>;

  /**
   * The maxlength attribute specifies the maximum number of characters allowed in the <input> element.
   */
  maxLength?: number | ValidationRule<number>;

  /**
   * The min attribute specifies the minimum value for an <input> element.
   *
   * Tip: Use the min attribute together with the max attribute to create a range of legal values.
   *
   * Note: The max and min attributes works with the following input types: number, range, date, datetime-local, month, time and week.
   */
  min?: number | string;

  /**
   * The max attribute specifies the maximum value for an <input> element.
   *
   * Tip: Use the max attribute together with the min attribute to create a range of legal values.
   *
   * Note: The max and min attributes works with the following input types: number, range, date, datetime-local, month, time and week.
   */
  max?: number | string;

  /**
   * The regex pattern for the input.
   *
   * Note: A RegExp object with the /g flag keeps track of the lastIndex where a match occurred.
   */
  pattern?: ValidationRule<RegExp>;

  // TODO remove these as UXD direction is not to use them
  selectTitle?: string;
  selectValue?: (selection: TSelection) => FieldPathValue<TSelection, FieldPath<TSelection>>;
  selectOpen?: (callback: (selection: TSelection) => void, title: string) => void;

  /**
   * The autofocus attribute is a boolean attribute.
   *
   * When present, it specifies that an <input> element should automatically get focus when the page loads.
   */
  autoFocus?: boolean;

  /**
   * The autocomplete attribute specifies whether or not an input field should have autocomplete enabled.
   *
   * Autocomplete allows the browser to predict the value. When a user starts to type in a field, the browser should display options to fill in the field, based on earlier typed values.
   *
   * Note: The autocomplete attribute works with the following input types: text, search, url, tel, email, password, datepickers, range, and color.
   */
  autoComplete?: string;
};

/** PatternFly TextInput wrapper for use with react-hook-form */
export function PageFormTextInput<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TSelection extends FieldValues = FieldValues
>(props: PageFormTextInputProps<TFieldValues, TFieldName, TSelection>) {
  const {
    id,
    type,
    name,
    label,
    labelHelpTitle,
    labelHelp,
    additionalControls,
    placeholder,
    button,
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

  const {
    control,
    setValue,
    trigger,
    formState: { isSubmitting, isValidating },
  } = useFormContext<TFieldValues>();

  const [translations] = useFrameworkTranslations();

  return (
    <Controller<TFieldValues, TFieldName>
      name={name}
      control={control}
      shouldUnregister
      render={({ field: { onChange, value, name }, fieldState: { error } }) => {
        function onChangeHandler(value: string) {
          onChange(value.trimStart());
        }
        return (
          <FormGroupTextInput
            id={id ?? name.split('.').join('-')}
            type={type}
            label={label}
            labelHelpTitle={labelHelpTitle}
            labelHelp={labelHelp}
            placeholder={placeholder}
            additionalControls={additionalControls}
            onBlur={() => trigger(name) as unknown as () => void}
            isRequired={isRequired}
            value={value}
            onChange={onChangeHandler}
            helperTextInvalid={
              error?.message
                ? validate && isValidating
                  ? translations.validating
                  : error?.message
                : undefined
            }
            isReadOnly={isReadOnly || isSubmitting}
            minLength={undefined}
            maxLength={undefined}
            min={min}
            max={max}
            autoFocus={autoFocus}
            autoComplete={autoComplete}
          >
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
                isDisabled={props.isDisabled || isSubmitting}
              >
                <SearchIcon />
              </Button>
            )}
            {button && button}
          </FormGroupTextInput>
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

        // TODO - max might be a string
        // - if type is date - parse string to date
        // - if type is number - parse string to number
        min:
          typeof label === 'string' && typeof min === 'number'
            ? {
                value: min,
                message: `${capitalizeFirstLetter(
                  label.toLocaleLowerCase()
                )} must be less than ${min}.`,
              }
            : minLength,

        // TODO - max might be a string
        // - if type is date - parse string to date
        // - if type is number - parse string to number
        max:
          typeof label === 'string' && typeof max === 'number'
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
