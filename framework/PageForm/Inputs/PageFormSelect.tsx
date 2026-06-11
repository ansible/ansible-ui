import {
  ButtonVariant,
  MenuFooter,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
} from '@patternfly/react-core';
import getValue from 'get-value';
import { ChangeEvent, ReactNode, useCallback, useEffect, useState } from 'react';
import {
  Controller,
  FieldPath,
  FieldPathValue,
  FieldValues,
  PathValue,
  Validate,
  useFormContext,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageActionSelection, PageActionType } from '../../PageActions/PageAction';
import { PageActions } from '../../PageActions/PageActions';
import { PageSelectOption } from '../../PageInputs/PageSelectOption';
import { getID, useID } from '../../hooks/useID';
import { useFrameworkTranslations } from '../../useFrameworkTranslations';
import { PageFormGroup } from './PageFormGroup';
import { useRequiredValidationRule } from './validation-hooks';

export interface SelectOptionObject {
  /** Function returns a string to represent the select option object */
  toString(): string;
  /** Function returns a true if the passed in select option is equal to this select option object, false otherwise */
  compareTo?(selectOption: unknown): boolean;
}

export type PageFormSelectProps<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TSelection = unknown,
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
  placeholderText?: string;

  footer?: ReactNode;

  options: PageSelectOption<TSelection>[];

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
  onChange?: (option?: TSelection) => void;

  validate?:
    | Validate<FieldPathValue<TFieldValues, TFieldName>, TFieldValues>
    | Record<string, Validate<FieldPathValue<TFieldValues, TFieldName>, TFieldValues>>;

  defaultValue?: FieldPathValue<TFieldValues, TFieldName>;

  enableReset?: boolean;
  enableUndo?: boolean;
};

export function PageFormSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TSelection = unknown,
>(props: PageFormSelectProps<TFieldValues, TFieldName, TSelection>) {
  const {
    additionalControls,
    footer,
    helperText,
    isDisabled,
    isReadOnly,
    isRequired,
    label,
    labelHelp,
    labelHelpTitle,
    name,
    options,
    placeholderText,
    validate,
  } = props;

  const id = useID(props);

  const { t } = useTranslation();

  const {
    control,
    setValue,
    getValues,
    formState: { isSubmitting, isValidating, defaultValues },
  } = useFormContext<TFieldValues>();

  const [isOpen, setIsOpen] = useState(false);
  const onToggle = useCallback(() => setIsOpen(!isOpen), [isOpen]);

  const [translations] = useFrameworkTranslations();
  const required = useRequiredValidationRule(props.label, props.isRequired);

  const undoValue = getValue(defaultValues as object, props.name) as PathValue<
    TFieldValues,
    TFieldName
  >;

  useEffect(() => {
    const value = getValues(props.name);
    if (!value) {
      if (options.length === 1 && isRequired) {
        setValue(props.name, options[0].value as PathValue<TFieldValues, TFieldName>);
      }
    }
  }, [getValues, isRequired, options, props.name, setValue]);

  const toggle = (toggleRef: React.Ref<MenuToggleElement>, selected?: string) => (
    <MenuToggle
      data-cy={`${id}-form-group`}
      data-testid={`${id}-form-group`}
      id={`${id}-form-group-toggle`}
      isDisabled={isDisabled || isReadOnly || isSubmitting}
      ref={toggleRef}
      onClick={onToggle}
      isExpanded={isOpen}
      isFullWidth
    >
      {selected ?? placeholderText}
    </MenuToggle>
  );

  return (
    <Controller<TFieldValues, TFieldName>
      name={name}
      control={control}
      defaultValue={props.defaultValue}
      shouldUnregister
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const onSelectHandler = (
          _event?: React.MouseEvent<Element, MouseEvent> | ChangeEvent<Element>,
          value?: string | number
        ) => {
          const selectedOption = options.find((option) => option.value === value);
          if (selectedOption) {
            onChange(selectedOption.value);
            if (props.onChange) {
              props.onChange(selectedOption.value);
            }
          }
          setIsOpen(false);
        };

        const helperTextInvalid = error?.message
          ? validate && isValidating
            ? translations.validating
            : error?.message
          : undefined;

        const selected = options.find((option) => option.value === value);

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
            <div style={{ display: 'flex' }} data-testid={id}>
              <Select
                aria-describedby={`${id}-form-group-select`}
                data-cy={id}
                data-testid={id}
                id={id}
                isOpen={isOpen}
                itemID={id}
                onOpenChange={(isOpen) => setIsOpen(isOpen)}
                onSelect={onSelectHandler}
                ouiaId="menu-select"
                shouldFocusToggleOnSelect
                toggle={(ref) => toggle(ref, selected?.label)}
                isScrollable
                popperProps={{
                  enableFlip: true,
                  preventOverflow: true,
                }}
              >
                <>
                  <SelectList>
                    {options.map((option) => {
                      const optionId = getID(option);
                      return (
                        <SelectOption
                          id={optionId}
                          key={option.label}
                          value={option.value}
                          label={option.label}
                          description={option.description}
                          data-cy={optionId}
                          data-testid={option.value}
                        >
                          {option.label}
                        </SelectOption>
                      );
                    })}
                  </SelectList>
                  {footer && <MenuFooter>{footer}</MenuFooter>}
                </>
              </Select>
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
                position={'right'}
              />
            </div>
          </PageFormGroup>
        );
      }}
      rules={{
        required,
        validate,
      }}
    />
  );
}
