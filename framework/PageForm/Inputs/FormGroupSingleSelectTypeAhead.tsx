import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
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
import { PageFormGroup } from './PageFormGroup';
import { useTranslation } from 'react-i18next';

export interface SelectOptionObject {
  toString(): string;
  compareTo?(selectOption: unknown): boolean;
}

export type FormGroupSingleSelectTypeAheadProps = {
  id?: string;
  label: string;
  labelHelp?: string | string[] | React.ReactNode;
  labelHelpTitle?: string;
  helperText?: string;
  helperTextInvalid?: string;
  additionalControls?: React.ReactNode;
  isReadOnly?: boolean;
  placeholderText?: string;
  options: { value: string; label: string }[];
  onHandleSelection: (value: { name: string }) => void;
  isSubmitting: boolean;
  value: string | string[] | Partial<{ name: string }> | null;
  onHandleClear: () => void;
  isRequired?: boolean;
  toggleButtonId?: string;
};

export function FormGroupSingleSelectTypeAhead(props: FormGroupSingleSelectTypeAheadProps) {
  const {
    id,
    label,
    labelHelp,
    labelHelpTitle,
    helperText,
    helperTextInvalid,
    additionalControls,
    isReadOnly,
    placeholderText,
    options: propOptions,
    onHandleSelection,
    isSubmitting,
    value: propValue,
    onHandleClear,
    isRequired,
    toggleButtonId = '',
  } = props;

  const { t } = useTranslation();

  const CREATE_NEW_VALUE = 'CREATE_NEW_VALUE';
  const placeholder = placeholderText ?? t('Select an option');

  const baseOptions: SelectOptionProps[] = useMemo(
    () =>
      propOptions.map((option) => ({
        value: option.value,
        children: option.label,
      })),
    [propOptions]
  );

  const initialSelected = useMemo(() => {
    if (propValue === null) return null;
    if (typeof propValue === 'string') return propValue;
    if (Array.isArray(propValue) && propValue.length > 0 && typeof propValue[0] === 'string') {
      return propValue[0];
    }
    if ((propValue as { name?: string })?.name) return (propValue as { name: string }).name;
    return null;
  }, [propValue]);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>(initialSelected ?? '');
  const [selected, setSelected] = useState<string | null>(initialSelected);
  const [selectOptions, setSelectOptions] = useState<SelectOptionProps[]>(baseOptions);
  const [focusedItemIndex, setFocusedItemIndex] = useState<number | null>(null);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  // Sync internal state with propValue changes
  useEffect(() => {
    if (propValue === null) {
      setSelected(null);
      setInputValue('');
      return;
    }

    let val: string | null = null;
    if (typeof propValue === 'string') {
      val = propValue;
    } else if (
      Array.isArray(propValue) &&
      propValue.length > 0 &&
      typeof propValue[0] === 'string'
    ) {
      val = propValue[0];
    } else if ((propValue as { name?: string })?.name) {
      val = (propValue as { name: string }).name;
    }

    setSelected(val);
    setInputValue(val ?? '');
  }, [propValue]);

  useEffect(() => {
    let filteredOptions: SelectOptionProps[] = baseOptions;

    if (inputValue) {
      // Filter options matching the input value (case-insensitive)
      filteredOptions = baseOptions.filter((option) =>
        String(option.children).toLowerCase().includes(inputValue.toLowerCase())
      );

      // Check for exact match
      const exactMatch = baseOptions.some(
        (option) => (option.children as string).toLowerCase() === inputValue.toLowerCase()
      );

      // If no exact match, add a "Create new option" entry
      if (!exactMatch) {
        filteredOptions = [
          ...filteredOptions,
          {
            children: `${t('Create new option')} "${inputValue}"`,
            value: CREATE_NEW_VALUE,
          },
        ];
      }
    }

    setSelectOptions(filteredOptions);
  }, [inputValue, baseOptions, t]);

  const createItemId = (value: string) => `select-create-typeahead-${value.replace(/\s+/g, '-')}`;

  const setActiveAndFocusedItem = (itemIndex: number) => {
    setFocusedItemIndex(itemIndex);
    const focusedItem = selectOptions[itemIndex];
    setActiveItemId(createItemId(focusedItem.value as string));
  };

  const resetActiveAndFocusedItem = () => {
    setFocusedItemIndex(null);
    setActiveItemId(null);
  };

  const closeMenu = () => {
    setIsOpen(false);
    resetActiveAndFocusedItem();
  };

  const onInputClick = () => {
    if (!isOpen) {
      setIsOpen(true);
    } else if (!inputValue) {
      closeMenu();
    }
  };

  const onSelect = (value: string) => {
    if (value) {
      if (value === CREATE_NEW_VALUE) {
        setSelected(inputValue);
        onHandleSelection({ name: inputValue });
        resetActiveAndFocusedItem();
        closeMenu();
      } else {
        if (selected && !baseOptions.some((option) => option.value === selected)) {
          setSelected(null);
        }
        setSelected(value);
        setInputValue(value);
        onHandleSelection({ name: value });
        closeMenu();
      }
    }
    textInputRef.current?.focus();
  };

  const onTextInputChange = (_event: React.FormEvent<HTMLInputElement>, value: string) => {
    setInputValue(value);
    resetActiveAndFocusedItem();
    if (!isOpen) {
      setIsOpen(true); // Open the menu when user types
    }
  };

  const findNextFocusableIndex = (startIndex: number, step: number): number | null => {
    const totalOptions = selectOptions.length;
    let index = startIndex;

    for (let i = 0; i < totalOptions; i++) {
      index = (index + step + totalOptions) % totalOptions;
      if (!selectOptions[index].isDisabled) {
        return index;
      }
    }

    return null;
  };

  const handleMenuArrowKeys = (key: string) => {
    if (!isOpen) {
      setIsOpen(true);
      return;
    }

    if (selectOptions.every((option) => option.isDisabled)) {
      return;
    }

    let indexToFocus: number | null = focusedItemIndex;

    if (key === 'ArrowUp') {
      if (indexToFocus === null) {
        indexToFocus = selectOptions.length - 1;
      } else {
        indexToFocus = findNextFocusableIndex(indexToFocus, -1);
      }
    } else if (key === 'ArrowDown') {
      if (indexToFocus === null) {
        indexToFocus = 0;
      } else {
        indexToFocus = findNextFocusableIndex(indexToFocus, 1);
      }
    }

    if (indexToFocus !== null) {
      setActiveAndFocusedItem(indexToFocus);
    }
  };

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const focusedItem = focusedItemIndex !== null ? selectOptions[focusedItemIndex] : null;

    switch (event.key) {
      case 'Enter':
        if (isOpen && focusedItem && !focusedItem.isDisabled) {
          onSelect(focusedItem.value as string);
        }

        if (!isOpen) {
          setIsOpen(true);
        }
        break;
      case 'ArrowUp':
      case 'ArrowDown':
        event.preventDefault();
        handleMenuArrowKeys(event.key);
        break;
      default:
        break;
    }
  };

  const onToggleClick = () => {
    setIsOpen((prev) => !prev);
    textInputRef.current?.focus();
  };

  const onClearButtonClick = () => {
    setSelected(null);
    setInputValue('');
    resetActiveAndFocusedItem();
    onHandleClear();
    textInputRef.current?.focus();
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      variant="typeahead"
      aria-label="Typeahead creatable menu toggle"
      onClick={onToggleClick}
      innerRef={toggleRef}
      isExpanded={isOpen}
      id={toggleButtonId}
      isFullWidth
      isDisabled={isReadOnly || isSubmitting}
    >
      <TextInputGroup isPlain>
        <TextInputGroupMain
          value={inputValue}
          onClick={onInputClick}
          onChange={onTextInputChange}
          onKeyDown={onInputKeyDown}
          id={`${id}-typeahead-select-input`}
          autoComplete="off"
          innerRef={textInputRef}
          placeholder={placeholder}
          {...(activeItemId && { 'aria-activedescendant': activeItemId })}
          isExpanded={isOpen}
          aria-controls={`${id}-typeahead-select-listbox`}
        />
        {(selected || inputValue) && (
          <TextInputGroupUtilities>
            <Button variant="plain" onClick={onClearButtonClick} aria-label="Clear input value">
              <TimesIcon aria-hidden />
            </Button>
          </TextInputGroupUtilities>
        )}
      </TextInputGroup>
    </MenuToggle>
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
        id={`${id}-typeahead-select`}
        isOpen={isOpen}
        selected={selected ?? undefined}
        onSelect={(_event, selection) => onSelect(selection as string)}
        onOpenChange={(open) => {
          if (!open) closeMenu();
        }}
        toggle={toggle}
        style={{
          maxWidth: '0%',
        }}
      >
        <SelectList
          id={`${id}-typeahead-select-listbox`}
          style={{
            overflowY: 'auto',
            maxHeight: '150px',
          }}
        >
          {selectOptions.map((option, index) => (
            <SelectOption
              key={`${option.value}-${index}`}
              isFocused={focusedItemIndex === index}
              isSelected={selected === option.value}
              id={createItemId(option.value as string)}
              {...option}
            />
          ))}
        </SelectList>
      </Select>
    </PageFormGroup>
  );
}
