import { SelectOptionProps } from '@patternfly/react-core';
import React, { useCallback, useRef } from 'react';

type TypeAheadOption = SelectOptionProps & { group?: string };

interface UseInteractionsProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  inputValue: string;
  setInputValue: (value: string) => void;
  setSelected: React.Dispatch<React.SetStateAction<string | null>>;
  selectOptions: TypeAheadOption[];
  setFocusedItemIndex: React.Dispatch<React.SetStateAction<number | null>>;
  setActiveItemId: React.Dispatch<React.SetStateAction<string | null>>;
  setIsUserTyping: React.Dispatch<React.SetStateAction<boolean>>;
  onHandleSelection: (value: { name: string }) => void;
  onHandleClear: () => void;
  getSelectedLabel: (value: string | null) => string;
}

export function useFormGroupSingleSelectTypeAheadInteractions(props: UseInteractionsProps) {
  const {
    isOpen,
    setIsOpen,
    inputValue,
    setInputValue,
    setSelected,
    selectOptions,
    setFocusedItemIndex,
    setActiveItemId,
    setIsUserTyping,
    onHandleSelection,
    onHandleClear,
    getSelectedLabel,
  } = props;
  const userInputRef = useRef<string>('');
  const textInputRef = useRef<HTMLInputElement>(null);

  const resetActiveAndFocusedItem = useCallback(() => {
    setFocusedItemIndex(null);
    setActiveItemId(null);
  }, [setActiveItemId, setFocusedItemIndex]);

  const createItemId = useCallback(
    (value: string) => `select-create-typeahead-${value.replace(/\s+/g, '-')}`,
    []
  );

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    resetActiveAndFocusedItem();
  }, [resetActiveAndFocusedItem, setIsOpen]);

  const onSelect = useCallback(
    (value: string) => {
      if (value && value !== 'NO_RESULTS') {
        setIsUserTyping(false);
        userInputRef.current = '';

        if (value === 'CREATE_NEW_VALUE') {
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
    },
    [
      closeMenu,
      getSelectedLabel,
      inputValue,
      onHandleSelection,
      resetActiveAndFocusedItem,
      setInputValue,
      setIsUserTyping,
      setSelected,
    ]
  );

  const onInputClick = useCallback(() => {
    if (!isOpen) {
      setIsOpen(true);
    } else if (!inputValue) {
      closeMenu();
    }
  }, [closeMenu, inputValue, isOpen, setIsOpen]);

  const onTextInputChange = useCallback(
    (_event: React.FormEvent<HTMLInputElement>, value: string) => {
      setInputValue(value);
      userInputRef.current = value;
      setIsUserTyping(true);
      setSelected(null);
      resetActiveAndFocusedItem();
      if (!isOpen) setIsOpen(true);
    },
    [isOpen, resetActiveAndFocusedItem, setInputValue, setIsOpen, setIsUserTyping, setSelected]
  );

  const onInputFocus = useCallback(() => {
    if (userInputRef.current || inputValue) setIsUserTyping(true);
  }, [inputValue, setIsUserTyping]);

  const findNextFocusableIndex = useCallback(
    (startIndex: number, step: number): number | null => {
      const totalOptions = selectOptions.length;
      let index = startIndex;
      for (let i = 0; i < totalOptions; i++) {
        index = (index + step + totalOptions) % totalOptions;
        if (!selectOptions[index].isDisabled) return index;
      }
      return null;
    },
    [selectOptions]
  );

  const handleMenuArrowKeys = useCallback(
    (key: string, focusedItemIndex: number | null) => {
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      if (selectOptions.every((option) => option.isDisabled)) return;

      let indexToFocus = focusedItemIndex;
      if (key === 'ArrowUp') {
        indexToFocus =
          indexToFocus === null
            ? selectOptions.length - 1
            : findNextFocusableIndex(indexToFocus, -1);
      } else if (key === 'ArrowDown') {
        indexToFocus = indexToFocus === null ? 0 : findNextFocusableIndex(indexToFocus, 1);
      }
      if (indexToFocus !== null) {
        setFocusedItemIndex(indexToFocus);
        setActiveItemId(createItemId(selectOptions[indexToFocus].value as string));
      }
    },
    [
      createItemId,
      findNextFocusableIndex,
      isOpen,
      selectOptions,
      setActiveItemId,
      setFocusedItemIndex,
      setIsOpen,
    ]
  );

  const onInputKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLElement>, focusedItemIndex: number | null) => {
      const focusedItem = focusedItemIndex === null ? null : selectOptions[focusedItemIndex];
      if (event.key === 'Enter') {
        if (isOpen && focusedItem && !focusedItem.isDisabled) onSelect(focusedItem.value as string);
        if (!isOpen) setIsOpen(true);
      } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault();
        handleMenuArrowKeys(event.key, focusedItemIndex);
      }
    },
    [handleMenuArrowKeys, isOpen, onSelect, selectOptions, setIsOpen]
  );

  const onToggleClick = useCallback(() => {
    setIsOpen((prev) => !prev);
    textInputRef.current?.focus();
  }, [setIsOpen]);

  const onClearButtonClick = useCallback(() => {
    setSelected(null);
    setInputValue('');
    setIsUserTyping(false);
    userInputRef.current = '';
    resetActiveAndFocusedItem();
    onHandleClear();
    textInputRef.current?.focus();
  }, [onHandleClear, resetActiveAndFocusedItem, setInputValue, setIsUserTyping, setSelected]);

  return {
    createItemId,
    closeMenu,
    onClearButtonClick,
    onInputClick,
    onInputFocus,
    onInputKeyDown,
    onSelect,
    onTextInputChange,
    onToggleClick,
    textInputRef,
    userInputRef,
  };
}
