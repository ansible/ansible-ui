import {
  Button,
  Divider,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectGroup,
  SelectList,
  SelectOption,
  SelectOptionProps,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
} from '@patternfly/react-core';
import TimesIcon from '@patternfly/react-icons/dist/esm/icons/times-icon';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageFormGroup } from './PageFormGroup';

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
  options: { value: string; label: string; group?: string }[];
  onHandleSelection: (value: { name: string }) => void;
  isSubmitting?: boolean;
  value: string | string[] | Partial<{ name: string }> | null;
  onHandleClear: () => void;
  isRequired?: boolean;
  toggleButtonId?: string;
  allowCreate?: boolean; // New prop to control creation of new options
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
    allowCreate = true,
  } = props;

  const { t } = useTranslation();

  const CREATE_NEW_VALUE = 'CREATE_NEW_VALUE';
  const placeholder = placeholderText ?? t('Select an option');

  const baseOptions: (SelectOptionProps & { group?: string })[] = useMemo(
    () =>
      propOptions.map((option) => ({
        value: option.value,
        children: option.label,
        group: option.group,
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

  const getInitialLabel = (value: string | null): string => {
    if (!value) return '';
    const option = propOptions.find((opt) => opt.value === value);
    return option ? option.label : value;
  };

  // Get the display label for the selected value
  const getSelectedLabel = useCallback(
    (value: string | null): string => {
      if (!value) return '';

      if (baseOptions.length === 0 && propOptions.length > 0) {
        const option = propOptions.find((opt) => opt.value === value);
        return option ? option.label : value;
      }

      const selectedOption = baseOptions.find((option) => option.value === value);
      return selectedOption ? (selectedOption.children as string) : value;
    },
    [baseOptions, propOptions]
  );

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [inputValue, setInputValueInternal] = useState<string>(getInitialLabel(initialSelected));
  const [selected, setSelected] = useState<string | null>(initialSelected);
  const [selectOptions, setSelectOptions] =
    useState<(SelectOptionProps & { group?: string })[]>(baseOptions);
  const [focusedItemIndex, setFocusedItemIndex] = useState<number | null>(null);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [isUserTyping, setIsUserTyping] = useState<boolean>(false);
  const userInputRef = useRef<string>('');
  const textInputRef = useRef<HTMLInputElement>(null);

  const setInputValue = useCallback((value: string) => {
    setInputValueInternal(value);
  }, []);

  // Sync internal state with propValue changes
  useEffect(() => {
    if (propValue === null) {
      setSelected(null);

      const hasActiveInput = userInputRef.current && userInputRef.current.length > 0;
      if (isUserTyping && hasActiveInput) {
        return;
      }

      setInputValue('');
      userInputRef.current = '';
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

    if (!isUserTyping) {
      setInputValue(getSelectedLabel(val));
      setIsUserTyping(false);
    }

    userInputRef.current = '';
  }, [propValue, getSelectedLabel, isUserTyping, setInputValue, inputValue]);

  // Update display label when baseOptions are populated
  useEffect(() => {
    if (selected && baseOptions.length > 0 && !isOpen && !isUserTyping) {
      const currentLabel = getSelectedLabel(selected);
      if (currentLabel !== inputValue && currentLabel !== '') {
        setInputValue(currentLabel);
      }
    }
  }, [baseOptions, selected, getSelectedLabel, inputValue, isOpen, isUserTyping, setInputValue]);

  useEffect(() => {
    let filteredOptions: (SelectOptionProps & { group?: string })[] = baseOptions;

    if (inputValue) {
      // Filter options matching the input value (case-insensitive)
      filteredOptions = baseOptions.filter((option) =>
        String(option.children).toLowerCase().includes(inputValue.toLowerCase())
      );

      // Check for exact match
      const exactMatch = baseOptions.some(
        (option) => (option.children as string).toLowerCase() === inputValue.toLowerCase()
      );

      // If no exact match and no filtered results
      if (!exactMatch && filteredOptions.length === 0) {
        if (allowCreate) {
          // Add a "Create new option" entry
          filteredOptions = [
            {
              children: `${t('Create new option')} "${inputValue}"`,
              value: CREATE_NEW_VALUE,
            },
          ];
        } else {
          // Show "No results found" message
          filteredOptions = [
            {
              children: t('No results found for "{{searchTerm}}"', { searchTerm: inputValue }),
              value: 'NO_RESULTS',
              isDisabled: true,
            },
          ];
        }
      } else if (!exactMatch && filteredOptions.length > 0 && allowCreate) {
        // Add a "Create new option" entry when there are filtered results but no exact match
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
  }, [inputValue, baseOptions, t, allowCreate]);

  // Group options if any have a group property
  const groups = useMemo(() => {
    const hasGroups = selectOptions.some((option) => !!option.group);
    if (hasGroups) {
      const groups: Record<string, (SelectOptionProps & { group?: string })[]> = {};
      for (const option of selectOptions) {
        const group = option.group ?? '';
        if (!groups[group]) groups[group] = [];
        groups[group].push(option);
      }
      return groups;
    }
  }, [selectOptions]);

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
    if (value && value !== 'NO_RESULTS') {
      setIsUserTyping(false);
      userInputRef.current = '';

      if (value === CREATE_NEW_VALUE) {
        setSelected(inputValue);
        setInputValue(inputValue);
        onHandleSelection({ name: inputValue });
        resetActiveAndFocusedItem();
        closeMenu();
      } else {
        setSelected(value);
        setInputValue(getSelectedLabel(value));
        onHandleSelection({ name: value });
        closeMenu();
      }
    }
    textInputRef.current?.focus();
  };

  const onTextInputChange = (_event: React.FormEvent<HTMLInputElement>, value: string) => {
    setInputValue(value);
    userInputRef.current = value;
    setIsUserTyping(true);
    setSelected(null);
    resetActiveAndFocusedItem();
    if (!isOpen) {
      setIsOpen(true); // Open the menu when user types
    }
  };

  const onInputFocus = () => {
    if (userInputRef.current || inputValue) {
      setIsUserTyping(true);
    }
  };

  const onInputBlur = () => {};

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
    setIsUserTyping(false);
    userInputRef.current = '';
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
          onFocus={onInputFocus}
          onBlur={onInputBlur}
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
            <Button
              icon={<TimesIcon aria-hidden />}
              variant="plain"
              onClick={onClearButtonClick}
              aria-label="Clear input value"
            />
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
        isScrollable
        selected={selected || ''}
        onSelect={(_event, selection) => onSelect(selection as string)}
        onOpenChange={(open) => {
          if (!open) closeMenu();
        }}
        toggle={toggle}
        style={{
          maxWidth: '0%',
        }}
      >
        {groups ? (
          <>
            {Object.keys(groups).map((groupName, groupIndex) => (
              <div key={groupName}>
                {groupIndex > 0 && <Divider />}
                <SelectGroup label={groupName || t('Other')}>
                  <SelectList id={`${id}-typeahead-select-listbox-${groupName}`}>
                    {groups[groupName].map((option, index) => {
                      const globalIndex = selectOptions.findIndex(
                        (opt) => opt.value === option.value
                      );
                      return (
                        <SelectOption
                          key={`${option.value}-${index}`}
                          isFocused={focusedItemIndex === globalIndex}
                          isSelected={selected === option.value}
                          id={createItemId(option.value as string)}
                          {...option}
                        />
                      );
                    })}
                  </SelectList>
                </SelectGroup>
              </div>
            ))}
          </>
        ) : (
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
        )}
      </Select>
    </PageFormGroup>
  );
}
