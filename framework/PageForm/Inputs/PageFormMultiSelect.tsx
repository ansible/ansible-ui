import { FormGroup } from '@patternfly/react-core';
import { ReactNode } from 'react';
import {
  Controller,
  FieldPath,
  FieldPathValue,
  FieldValues,
  Validate,
  useFormContext,
} from 'react-hook-form';
import { Help } from '../../components/Help';
import { useFrameworkTranslations } from '../../useFrameworkTranslations';
import { capitalizeFirstLetter } from '../../utils/strings';
import { PageMultiSelect } from '../../PageInputs/PageMultiSelect';
import { PageSelectOption } from '../../PageInputs/PageSelectOption';

export type PageFormMultiSelectProps<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  ValueT = FieldPathValue<TFieldValues, TFieldName>,
> = {
  /**
   * The id attribute specifies a unique id for an HTML element. The value of the id attribute must be unique within the HTML document.
   *
   * It is also used by JavaScript to access and manipulate the element with the specific id.
   */
  id?: string;

  /**
   * The name attribute specifies the name of an <input> element.
   *
   * The name attribute is used to reference elements in a JavaScript, or to reference form data after a form is submitted.
   */
  name: TFieldName;

  /**
   * The <label> tag defines a label for several elements.
   *
   * Proper use of labels with the elements will benefit:
   * - Screen reader users (will read out loud the label, when the user is focused on the element)
   * - Users who have difficulty clicking on very small regions (such as checkboxes) - because when a user clicks the text within the <label> element, it toggles the input (this increases the hit area).
   */
  label?: string;
  labelHelpTitle?: string;
  labelHelp?: ReactNode;

  /**
   * The placeholder attribute specifies a short hint that describes the expected value of an input field (e.g. a sample value or a short description of the expected format).
   *
   * The short hint is displayed in the input field before the user enters a value.
   *
   * Note: The placeholder attribute works with the following input types: text, search, url, tel, email, and password.
   */
  placeholderText?: string;

  options: PageSelectOption<ValueT>[];

  helperText?: string;

  /**
   * When present, it specifies that the <input> element should be disabled.
   *
   * A disabled input element is unusable and un-clickable.
   *
   * The disabled attribute can be set to keep a user from using the <input> element until some other condition has been met (like selecting a checkbox, etc.). Then, a JavaScript could remove the disabled value, and make the <input> element usable.
   */
  isDisabled?: boolean;

  /**
   * When present, it specifies that an input field is read-only.
   *
   * A read-only input field cannot be modified (however, a user can tab to it, highlight it, and copy the text from it).
   *
   * The readonly attribute can be set to keep a user from changing the value until some other conditions have been met (like selecting a checkbox, etc.). Then, a JavaScript can remove the readonly value, and make the input field editable.
   */
  isReadOnly?: boolean;

  /**
   * When present, it specifies that an input field must be filled out before submitting the form.
   *
   * Note: The required attribute works with the following input types: text, search, url, tel, email, password, date pickers, number, checkbox, radio, and file.
   */
  isRequired?: boolean;

  validate?:
    | Validate<FieldPathValue<TFieldValues, TFieldName>, TFieldValues>
    | Record<string, Validate<FieldPathValue<TFieldValues, TFieldName>, TFieldValues>>;
};

export function PageFormMultiSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: PageFormMultiSelectProps<TFieldValues, TFieldName>) {
  const {
    name,
    label,
    labelHelpTitle,
    labelHelp,
    placeholderText,
    options,
    helperText,
    isDisabled,
    isReadOnly,
    isRequired,
    validate,
  } = props;

  const id = props.id ?? name.split('.').join('-');

  const {
    control,
    formState: { isSubmitting, isValidating },
  } = useFormContext<TFieldValues>();

  const [translations] = useFrameworkTranslations();

  return (
    <Controller<TFieldValues, TFieldName>
      name={name}
      control={control}
      shouldUnregister
      render={({ field: { value, onChange }, fieldState: { error } }) => {
        const helperTextInvalid = error?.message
          ? validate && isValidating
            ? translations.validating
            : error?.message
          : undefined;

        return (
          <FormGroup
            id={`${id ?? ''}-form-group`}
            fieldId={id}
            label={label}
            labelIcon={labelHelp ? <Help title={labelHelpTitle} help={labelHelp} /> : undefined}
            helperText={helperText}
            helperTextInvalid={helperTextInvalid}
            validated={helperTextInvalid ? 'error' : undefined}
            isRequired={isRequired}
          >
            <PageMultiSelect
              id={id}
              placeholder={placeholderText}
              options={options}
              aria-describedby={id ? `${id}-form-group` : undefined}
              values={value}
              onSelect={(getNewValues) => onChange(getNewValues(value))}
              isDisabled={isDisabled || isReadOnly || isSubmitting}
            />
          </FormGroup>
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
      }}
    />
  );
}
