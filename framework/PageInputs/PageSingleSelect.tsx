import { MenuToggle, MenuToggleElement, Stack } from '@patternfly/react-core';
import { Select, SelectList, SelectOption } from '@patternfly/react-core/next';
import { ReactNode, useState } from 'react';
import styled from 'styled-components';

const PlacedholderWrapper = styled.span`
  color: var(--pf-global--Color--dark-200);
`;

export interface PageSelectOption<T> {
  label: string;
  description?: string;
  value: T;
}

export enum PageSelectVariant {
  Single = 'Single',
  Typeahead = 'Typeahead',
}

type PageSelectVariants = keyof typeof PageSelectVariant;

interface IPageSingleSelect<T> {
  id?: string;
  value: T;
  onChange: (value: T) => void;
  options: PageSelectOption<T>[];
  placeholder?: string;
  icon?: ReactNode;
  variant?: PageSelectVariants;
}

/** Single select for the page framework. */
export function PageSingleSelect<T>(props: IPageSingleSelect<T>) {
  const { value, onChange, options, placeholder } = props;
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
      id={props.id}
      ref={toggleRef}
      onClick={() => setIsOpen((open) => !open)}
      isExpanded={isOpen}
      style={{ width: 200 }}
    >
      {props.icon && <span style={{ paddingLeft: 4, paddingRight: 12 }}>{props.icon}</span>}
      {selectedOption ? (
        <span>{selectedOption.label}</span>
      ) : (
        <PlacedholderWrapper>{placeholder}</PlacedholderWrapper>
      )}
    </MenuToggle>
  );

  return (
    <Select
      selected={value}
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
          <SelectOption key={option.label} itemId={option.value}>
            <Stack>
              <span>{option.label}</span>
              {option.description && <span>{option.description}</span>}
            </Stack>
          </SelectOption>
        ))}
      </SelectList>
    </Select>
  );
}
