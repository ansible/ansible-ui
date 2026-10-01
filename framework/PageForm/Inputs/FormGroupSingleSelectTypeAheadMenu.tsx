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
import React from 'react';

type TypeAheadOption = SelectOptionProps & { group?: string };

interface TypeAheadMenuProps {
  id?: string;
  toggleButtonId: string;
  isOpen: boolean;
  isReadOnly?: boolean;
  isSubmitting?: boolean;
  inputValue: string;
  placeholder: string;
  selected: string | null;
  selectOptions: TypeAheadOption[];
  groups?: Record<string, TypeAheadOption[]>;
  focusedItemIndex: number | null;
  activeItemId: string | null;
  createItemId: (value: string) => string;
  onInputClick: () => void;
  onTextInputChange: (event: React.FormEvent<HTMLInputElement>, value: string) => void;
  onInputKeyDown: (
    event: React.KeyboardEvent<HTMLElement>,
    focusedItemIndex: number | null
  ) => void;
  onInputFocus: () => void;
  onSelect: (value: string) => void;
  onToggleClick: () => void;
  onClearButtonClick: () => void;
  onClose: () => void;
  textInputRef: React.RefObject<HTMLInputElement>;
  t: (key: string) => string;
}

export function FormGroupSingleSelectTypeAheadMenu(props: TypeAheadMenuProps) {
  const {
    id,
    toggleButtonId,
    isOpen,
    isReadOnly,
    isSubmitting,
    inputValue,
    placeholder,
    selected,
    selectOptions,
    groups,
    focusedItemIndex,
    activeItemId,
    createItemId,
    onInputClick,
    onTextInputChange,
    onInputKeyDown,
    onInputFocus,
    onSelect,
    onToggleClick,
    onClearButtonClick,
    onClose,
    textInputRef,
    t,
  } = props;

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
          onKeyDown={(event) => onInputKeyDown(event, focusedItemIndex)}
          onFocus={onInputFocus}
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
    <Select
      id={`${id}-typeahead-select`}
      isOpen={isOpen}
      isScrollable
      selected={selected || ''}
      onSelect={(_event, selection) => onSelect(selection as string)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      toggle={toggle}
      style={{ maxWidth: '0%' }}
    >
      {groups ? (
        <>
          {Object.keys(groups).map((groupName, groupIndex) => (
            <div key={groupName}>
              {groupIndex > 0 && <Divider />}
              <SelectGroup label={groupName || t('Other')}>
                <SelectList id={`${id}-typeahead-select-listbox-${groupName}`}>
                  {groups[groupName].map((option, index) => (
                    <SelectOption
                      key={`${option.value}-${index}`}
                      isFocused={
                        focusedItemIndex ===
                        selectOptions.findIndex((opt) => opt.value === option.value)
                      }
                      isSelected={selected === option.value}
                      id={createItemId(option.value as string)}
                      {...option}
                    />
                  ))}
                </SelectList>
              </SelectGroup>
            </div>
          ))}
        </>
      ) : (
        <SelectList
          id={`${id}-typeahead-select-listbox`}
          style={{ overflowY: 'auto', maxHeight: '150px' }}
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
  );
}
