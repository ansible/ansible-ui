import { MenuToggle, MenuToggleElement } from '@patternfly/react-core';
import { Select, SelectList, SelectOption } from '@patternfly/react-core/next';
import { ReactNode, useState } from 'react';
import styled from 'styled-components';
import { PageSelectOption } from './PageSelectOption';

/** Single-select component */
export function PageSingleSelect<T>(props: {
  /** The ID of the select. */
  id?: string;

  /** The icon to show in the select. */
  icon?: ReactNode;

  /** The placeholder to show when no value is selected. */
  placeholder?: string;

  /** The selected value. */
  value: T;

  /** The function to set the selected value. */
  onSelect: (value: T) => void;

  /** The options to select from. */
  options: PageSelectOption<T>[];
}) {
  const { id, icon, value, onSelect: onChange, options, placeholder } = props;
  const [isOpen, setIsOpen] = useState(false);

  let selectedOption: PageSelectOption<T> | undefined = undefined;
  for (const option of options) {
    if (value === option.value) {
      selectedOption = option;
      break;
    }
  }

  const Toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      id={id}
      ref={toggleRef}
      onClick={() => setIsOpen((open) => !open)}
      isExpanded={isOpen}
      style={{ width: '100%', minWidth: 100 }}
    >
      {icon && <span style={{ paddingLeft: 4, paddingRight: 12 }}>{icon}</span>}
      {selectedOption ? selectedOption.label : <Placedholder>{placeholder}</Placedholder>}
    </MenuToggle>
  );

  return (
    <Select
      selected={selectedOption?.label}
      onSelect={(_, itemId: string | number | undefined) => {
        const newSelectedOption = options.find((option) => option.label === itemId);
        if (newSelectedOption) {
          onChange(newSelectedOption.value);
          setIsOpen(false);
        }
      }}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      toggle={Toggle}
      style={{ zIndex: isOpen ? 9999 : undefined }}
    >
      <SelectList>
        {options.map((option) => (
          <SelectOption key={option.label} itemId={option.label} description={option.description}>
            {option.label}
          </SelectOption>
        ))}
      </SelectList>
    </Select>
  );
}

const Placedholder = styled.span`
  opacity: 0.7;
`;
