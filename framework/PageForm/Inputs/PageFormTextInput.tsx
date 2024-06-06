import {
  Button,
  ButtonVariant,
  InputGroup,
  InputGroupItem,
  TextInput,
} from '@patternfly/react-core';
import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { EyeIcon, EyeSlashIcon, SearchIcon } from '@patternfly/react-icons';
import getValue from 'get-value';
import { ReactNode, useState } from 'react';
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
import { useTranslation } from 'react-i18next';
import { PageActionSelection, PageActionType } from '../../PageActions/PageAction';
import { PageActions } from '../../PageActions/PageActions';
import { useID } from '../../hooks/useID';
import { useFrameworkTranslations } from '../../useFrameworkTranslations';
import { capitalizeFirstLetter } from '../../utils/strings';
import { PageFormGroup } from './PageFormGroup';
import { useRequiredValidationRule } from './validation-hooks';

export type PageFormTextInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TSelection extends FieldValues = FieldValues,
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

  labelHelpTitle?: string;
  labelHelp?: string | string[] | ReactNode;

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
  button?: ReactNode;

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

  /**
   * You can pass a callback function as the argument to validate, or you can pass an object of callback functions to validate all of them. This function will be executed on its own without depending on other validation rules included in the required attribute.
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

  defaultValue?: FieldPathValue<TFieldValues, TFieldName>;

  enableUndo?: boolean;
  enableReset?: boolean;
};

/**
 * TextInput component that is used to render a text input field in a PageForm.
 *
 * It leverages `react-hook-form` to register itself to the parent form and to perform validation.
 */
export function PageFormTextInput<
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
    defaultValue,
  } = props;

  const id = useID(props);
  const { t } = useTranslation();

  const {
    control,
    setValue,
    formState: { isSubmitting, isValidating, defaultValues },
  } = useFormContext<TFieldValues>();

  const [showSecret, setShowSecret] = useState(false);

  const [translations] = useFrameworkTranslations();
  const required = useRequiredValidationRule(props.label, props.isRequired);

  const undoValue = getValue(defaultValues as object, props.name) as PathValue<
    TFieldValues,
    TFieldName
  >;

  return (
    <Controller<TFieldValues, TFieldName>
      name={name}
      control={control}
      shouldUnregister
      defaultValue={props.defaultValue}
      render={({ field: { onChange, value, name }, fieldState: { error } }) => {
        const helperTextInvalid = error?.message
          ? validate && isValidating
            ? translations.validating
            : error?.message
          : undefined;

        let parsedValue: string = value;
        switch (type) {
          case 'datetime-local':
            if (value) {
              const utcDate = new Date(value);
              const localDate = new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60000);
              parsedValue = localDate.toISOString().slice(0, 16);
            }
            break;
        }

        function onChangeHandler(value: string) {
          switch (props.type) {
            case 'datetime-local': {
              onChange(new Date(value).toISOString());
              break;
            }
            case 'number': {
              let numberValue = Number(value);
              if (value === '' || isNaN(numberValue)) {
                setValue(name, null as PathValue<TFieldValues, TFieldName>);
                onChange(null);
                return;
              }

              if (max !== undefined && numberValue > Number(max)) {
                numberValue = Number(max);
              }

              if (min !== undefined && numberValue < Number(min)) {
                numberValue = Number(min);
              }
              setValue(name, numberValue as unknown as PathValue<TFieldValues, TFieldName>);
              onChange(numberValue);
              break;
            }
            default:
              onChange(value.trimStart());
          }
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
          >
            <InputGroup>
              <InputGroupItem isFill>
                <TextInput
                  id={id}
                  placeholder={placeholder}
                  onChange={(_event, value: string) => onChangeHandler(value)}
                  value={parsedValue ?? ''}
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
                  <SearchIcon data-cy="lookup-button" />
                </Button>
              )}
              {button}
              <PageActions
                actions={[
                  {
                    label: t('Undo changes'),
                    type: PageActionType.Button,
                    selection: PageActionSelection.None,
                    onClick: () => {
                      setValue(
                        props.name,
                        undoValue as unknown as PathValue<TFieldValues, TFieldName>
                      );
                    },
                    isHidden: () => !props.enableUndo || value === undoValue,
                  },
                  {
                    label: t('Reset to default'),
                    type: PageActionType.Button,
                    selection: PageActionSelection.None,
                    onClick: () => {
                      setValue(
                        props.name as FieldPath<TFieldValues>,
                        props.defaultValue as unknown as PathValue<
                          TFieldValues,
                          FieldPath<TFieldValues>
                        >
                      );
                    },
                    isHidden: () => !props.enableReset || value === props.defaultValue,
                  },
                ]}
                variant={ButtonVariant.control}
                position={DropdownPosition.right}
              />
            </InputGroup>
          </PageFormGroup>
        );
      }}
      rules={{
        required,
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
                )} must be greater or equal to ${min}.`,
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
            : max,

        pattern,
      }}
    />
  );
}
