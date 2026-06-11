/* eslint-disable i18next/no-literal-string */
import {
  Label,
  LabelGroup,
  Button,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  SelectOptionProps,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
} from '@patternfly/react-core';

import TimesIcon from '@patternfly/react-icons/dist/esm/icons/times-icon';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useID } from '../../hooks/useID';
import { PageFormGroup } from './PageFormGroup';

export interface SelectOptionObject {
  toString(): string;
  compareTo?(selectOption: unknown): boolean;
}

export type FormGroupTypeAheadMultiSelectProps = {
  id?: string;
  label: string;
  labelHelp?: string | string[] | React.ReactNode;
  labelHelpTitle?: string;
  helperText?: string;
  helperTextInvalid?: string;
  additionalControls?: React.ReactNode;
  isReadOnly?: boolean;
  placeholderText?: string | React.ReactNode;
  options: { value: string | { name: string }; label: string }[];
  onHandleSelection: (value: { name: string }) => void;
  isSubmitting: boolean;
  value: Partial<{ name: string; isReadOnly?: boolean }>[];
  onHandleClear: (chip?: string) => void;
  isRequired?: boolean;
};

const CREATE_NEW_VALUE = 'CREATE_NEW_VALUE';

/** A PatternFly FormGroup with a PatternFly Select */
export function FormGroupTypeAheadMultiSelect(props: FormGroupTypeAheadMultiSelectProps) {
  const {
    additionalControls,
    helperText,
    helperTextInvalid,
    isReadOnly,
    isRequired,
    isSubmitting,
    label,
    labelHelp,
    labelHelpTitle,
    onHandleClear,
    onHandleSelection,
    options,
    placeholderText,
    value = [],
  } = props;

  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');
  const [selectOptions, setSelectOptions] = useState<SelectOptionProps[]>([]);
  const [focusedItemIndex, setFocusedItemIndex] = useState<number | null>(null);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  const id = useID(props);

  const getCreateNewLabel = useCallback(
    (filter: string) => t('Create "{{filterValue}}"', { filterValue: filter }),
    [t]
  );

  useEffect(() => {
    let newSelectOptions = options.map((option) => ({
      value: option.value,
      children: option.label,
    }));

    if (filterValue) {
      // Filter options based on input
      newSelectOptions = newSelectOptions.filter((option) =>
        String(option.children).toLowerCase().includes(filterValue.toLowerCase())
      );

      // Check if the input matches any existing option
      const optionExists = options.some(
        (option) =>
          typeof option.label === 'string' &&
          option.label.toLowerCase() === filterValue.toLowerCase()
      );

      // If not, add the "Create new" option
      if (!optionExists) {
        newSelectOptions = [
          ...newSelectOptions,
          {
            value: CREATE_NEW_VALUE,
            children: getCreateNewLabel(filterValue),
          },
        ];
      }

      // Open the dropdown if it's not already open
      if (!isOpen) {
        setIsOpen(true);
      }
    }

    setSelectOptions(newSelectOptions);
  }, [filterValue, options, isOpen, getCreateNewLabel]);

  const onToggleClick = useCallback(() => {
    setIsOpen((prevIsOpen) => !prevIsOpen);
    textInputRef.current?.focus();
  }, []);

  const onSelectHandler = useCallback(
    (
      _event: React.MouseEvent<Element, MouseEvent> | undefined,
      selectedValue: string | number | undefined
    ) => {
      if (selectedValue) {
        if (selectedValue === CREATE_NEW_VALUE) {
          onHandleSelection({ name: filterValue });
        } else {
          const selectedOption = selectOptions.find((option) => option.value === selectedValue);
          if (selectedOption) {
            const optionLabel =
              typeof selectedOption.children === 'string'
                ? selectedOption.children
                : String(selectedOption.children);
            onHandleSelection({ name: optionLabel });
          }
        }
        setInputValue('');
        setFilterValue('');
        setIsOpen(false);
        setFocusedItemIndex(null);
        setActiveItemId(null);
      }
    },
    [filterValue, onHandleSelection, selectOptions]
  );

  const onInputChangeHandler = useCallback(
    (_event: React.FormEvent<HTMLInputElement>, value: string) => {
      setInputValue(value);
      setFilterValue(value);
      setFocusedItemIndex(null);
      setActiveItemId(null);
    },
    []
  );

  const onInputKeyDownHandler = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      const key = event.key;
      if (key === 'Enter') {
        event.preventDefault();
        if (selectOptions[focusedItemIndex ?? 0]) {
          const optionValue = selectOptions[focusedItemIndex ?? 0].value as string | number;
          if (optionValue !== undefined) {
            onSelectHandler(undefined, optionValue);
          }
        }
      } else if (key === 'ArrowDown' || key === 'ArrowUp') {
        event.preventDefault();
        let newIndex = focusedItemIndex !== null ? focusedItemIndex : -1;
        if (key === 'ArrowDown') {
          newIndex = (newIndex + 1) % selectOptions.length;
        } else {
          newIndex = (newIndex - 1 + selectOptions.length) % selectOptions.length;
        }
        setFocusedItemIndex(newIndex);
        setActiveItemId(`option-${newIndex}`);
      } else if (key === 'Escape') {
        setIsOpen(false);
        setFocusedItemIndex(null);
        setActiveItemId(null);
      }
    },
    [focusedItemIndex, onSelectHandler, selectOptions]
  );

  const onClearButtonClick = useCallback(() => {
    setInputValue('');
    setFilterValue('');
    setFocusedItemIndex(null);
    setActiveItemId(null);
    textInputRef.current?.focus();
  }, []);

  const Toggle = useCallback(
    (toggleRef: React.Ref<MenuToggleElement>) => (
      <MenuToggle
        ref={toggleRef}
        isDisabled={isReadOnly || isSubmitting}
        onClick={onToggleClick}
        variant="typeahead"
        isExpanded={isOpen}
        isFullWidth
        data-cy="typeahead-menu-toggle"
        data-testid="typeahead-menu-toggle"
      >
        <TextInputGroup isPlain isDisabled={isReadOnly || isSubmitting}>
          <TextInputGroupMain
            value={inputValue}
            onClick={onToggleClick}
            onChange={onInputChangeHandler}
            onKeyDown={onInputKeyDownHandler}
            id={`${id}-input`}
            autoComplete="off"
            innerRef={textInputRef}
            placeholder={placeholderText as string}
            {...(activeItemId && {
              'aria-activedescendant': activeItemId,
            })}
            isExpanded={isOpen}
            aria-controls={`${id}-listbox`}
            aria-expanded={isOpen}
            data-cy={`${id}-typeahead-input`}
            data-testid={`${id}-input`}
          >
            <LabelGroup
              isClosable
              onClick={() => onHandleClear()}
              aria-label={t('Current selections')}
            >
              {value?.map((v) => {
                if (!v?.name) return null;

                const isReadOnly = !!v?.isReadOnly;
                const handleClose = isReadOnly
                  ? undefined
                  : (ev: React.MouseEvent) => {
                      ev.stopPropagation();
                      onHandleClear(v.name);
                    };

                return (
                  <Label
                    variant="outline"
                    key={v.name}
                    isDisabled={isReadOnly}
                    onClose={handleClose}
                    data-cy="selected-chip"
                    data-testid="selected-chip"
                  >
                    {v.name}
                  </Label>
                );
              })}
            </LabelGroup>
          </TextInputGroupMain>
          {inputValue && (
            <TextInputGroupUtilities>
              <Button
                icon={<TimesIcon aria-hidden />}
                variant="plain"
                onClick={onClearButtonClick}
                aria-label={t('Clear input value')}
                data-cy="clear-button"
                data-testid="clear-button"
              />
            </TextInputGroupUtilities>
          )}
        </TextInputGroup>
      </MenuToggle>
    ),
    [
      isReadOnly,
      isSubmitting,
      onToggleClick,
      isOpen,
      inputValue,
      onInputChangeHandler,
      onInputKeyDownHandler,
      id,
      placeholderText,
      activeItemId,
      onClearButtonClick,
      value,
      onHandleClear,
      t,
    ]
  );

  return (
    <PageFormGroup
      fieldId={id}
      label={label}
      labelHelp={labelHelp}
      labelHelpTitle={labelHelpTitle ?? label}
      helperTextInvalid={helperTextInvalid}
      isRequired={isRequired}
      additionalControls={additionalControls}
      helperText={helperText}
    >
      <Select
        isOpen={isOpen}
        id={id}
        toggle={Toggle}
        onSelect={onSelectHandler}
        isScrollable
        onOpenChange={(open) => setIsOpen(open)}
        shouldFocusFirstItemOnOpen={false}
        aria-label={label}
        data-cy={`${id}-typeahead-select`}
        data-testid={`${id}-typeahead-select`}
      >
        <SelectList id={`${id}-listbox`} data-cy="select-list">
          {selectOptions.map((option, index) => (
            <SelectOption
              isDisabled={Boolean(value.find((val) => val.name === option.value && val.isReadOnly))}
              key={String(option.value) || String(option.children)}
              isFocused={focusedItemIndex === index}
              id={`option-${index}`}
              data-cy={`select-option-${option.value}`}
              data-testid={`select-option-${option.value}`}
              {...option}
            />
          ))}
        </SelectList>
      </Select>
    </PageFormGroup>
  );
}
