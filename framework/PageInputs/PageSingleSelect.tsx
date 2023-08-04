import { MenuToggle, MenuToggleElement } from '@patternfly/react-core';
import { Select, SelectList, SelectOption } from '@patternfly/react-core/next';
import { ReactNode, useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import { PageSelectOption, getPageSelectOptions } from './PageSelectOption';

/** Single-select component */
export function PageSingleSelect<ValueT>(props: {
  /** The ID of the select. */
  id?: string;

  /** The icon to show in the select. */
  icon?: ReactNode;

  /** The placeholder to show when no value is selected. */
  placeholder: string;

  /** The selected value. */
  value: ValueT;

  /** The function to set the selected value. */
  onSelect: (value: ValueT) => void;

  /** The options to select from. */
  options: PageSelectOption<ValueT>[];
}) {
  const { id, icon, value, onSelect, placeholder } = props;
  const [isOpen, setIsOpen] = useState(false);

  const options = getPageSelectOptions<ValueT>(props.options);

  const selectedOption = useMemo(
    () => options.find((option) => value === option.value),
    [options, value]
  );

  const Toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      id={id}
      ref={toggleRef}
      onClick={() => setIsOpen((open) => !open)}
      isExpanded={isOpen}
    >
      {icon && <span style={{ paddingLeft: 4, paddingRight: 12 }}>{icon}</span>}
      {selectedOption ? selectedOption.label : <Placedholder>{placeholder}</Placedholder>}
    </MenuToggle>
  );

  const onSelectHandler = useCallback(
    (_: unknown, itemId: string | number | undefined) => {
      const newSelectedOption = options.find((option) => {
        if (option.key !== undefined) return option.key === itemId;
        else return option.label === itemId;
      });
      if (newSelectedOption) {
        onSelect(newSelectedOption.value);
        setIsOpen(false);
      }
    },
    [onSelect, options]
  );

  return (
    <Select
      selected={selectedOption?.label}
      onSelect={onSelectHandler}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      toggle={Toggle}
      style={{ zIndex: isOpen ? 9999 : undefined }}
      isScrollable
    >
      <SelectList>
        {options.map((option) => (
          <SelectOption
            key={option.key}
            itemId={option.key !== undefined ? option.key : option.label}
            description={option.description}
          >
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
