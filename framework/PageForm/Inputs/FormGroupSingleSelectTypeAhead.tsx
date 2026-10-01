import { SelectOptionProps } from '@patternfly/react-core';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageFormGroup } from './PageFormGroup';
import { FormGroupSingleSelectTypeAheadMenu } from './FormGroupSingleSelectTypeAheadMenu';
import { useFormGroupSingleSelectTypeAheadInteractions } from './useFormGroupSingleSelectTypeAheadInteractions';
import { useFormGroupSingleSelectTypeAheadOptions } from './useFormGroupSingleSelectTypeAheadOptions';

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
  const [focusedItemIndex, setFocusedItemIndex] = useState<number | null>(null);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [isUserTyping, setIsUserTyping] = useState<boolean>(false);

  const setInputValue = useCallback((value: string) => {
    setInputValueInternal(value);
  }, []);

  const { groups, selectOptions } = useFormGroupSingleSelectTypeAheadOptions(
    baseOptions,
    inputValue,
    allowCreate,
    t
  );

  const { textInputRef, userInputRef, ...interactions } =
    useFormGroupSingleSelectTypeAheadInteractions({
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
    });
  const { closeMenu, ...menuInteractions } = interactions;

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
      <FormGroupSingleSelectTypeAheadMenu
        id={id}
        toggleButtonId={toggleButtonId}
        isOpen={isOpen}
        isReadOnly={isReadOnly}
        isSubmitting={isSubmitting}
        inputValue={inputValue}
        placeholder={placeholder}
        selected={selected}
        selectOptions={selectOptions}
        groups={groups}
        focusedItemIndex={focusedItemIndex}
        activeItemId={activeItemId}
        textInputRef={textInputRef}
        {...menuInteractions}
        onClose={closeMenu}
        t={t}
      />
    </PageFormGroup>
  );
}
