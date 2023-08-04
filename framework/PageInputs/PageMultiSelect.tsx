import { Chip, ChipGroup, MenuToggle, MenuToggleElement } from '@patternfly/react-core';
import { Select, SelectList, SelectOption } from '@patternfly/react-core/next';
import { ReactNode, useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import { PageSelectOption, getPageSelectOptions } from './PageSelectOption';

/** Multi-select component */
export function PageMultiSelect<ValueT>(props: {
  /** The ID of the select. */
  id?: string;

  /** The icon to show in the select. */
  icon?: ReactNode;

  /** The placeholder to show when no values are selected. */
  placeholder: ReactNode;

  /** The selected values. */
  values: ValueT[] | undefined | null;

  /** The function to set the selected values. */
  onSelect: (setter: (currentValues: ValueT[] | undefined) => ValueT[] | undefined) => void;

  /** The options to select from. */
  options: PageSelectOption<ValueT>[];

  /** The variant of the select. */
  variant?: 'chips' | 'count';
}) {
  const { id, icon, placeholder, values, onSelect, variant } = props;
  const [isOpen, setIsOpen] = useState(false);

  const options = getPageSelectOptions<ValueT>(props.options);

  const selectedOptions = useMemo(
    () =>
      options.filter((option) => {
        if (values === undefined || values === null) {
          return false;
        }
        return values.includes(option.value);
      }),
    [options, values]
  );

  const Toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      id={id}
      ref={toggleRef}
      onClick={() => setIsOpen((open) => !open)}
      isExpanded={isOpen}
    >
      {icon && <span style={{ paddingLeft: 4, paddingRight: 12 }}>{icon}</span>}
      {selectedOptions.length > 0 ? (
        <>
          {variant === 'count' ? (
            <Chip isReadOnly>{selectedOptions.length}</Chip>
          ) : (
            <ChipGroup>
              {selectedOptions.map((option) => (
                <Chip key={option.label} isReadOnly>
                  {option.label}
                </Chip>
              ))}
            </ChipGroup>
          )}
        </>
      ) : (
        <Placedholder>{placeholder}</Placedholder>
      )}
    </MenuToggle>
  );

  const selected = useMemo(() => selectedOptions.map((option) => option.label), [selectedOptions]);

  const onSelectHandler = useCallback(
    (_: unknown, itemId: string | number | undefined) => {
      onSelect((previousValues: ValueT[] | undefined) => {
        const newSelectedOption = options.find((option) => option.key === itemId);
        if (newSelectedOption) {
          if (previousValues?.find((value) => value === newSelectedOption.value)) {
            previousValues = previousValues.filter((value) => value !== newSelectedOption.value);
          } else {
            previousValues = previousValues ? [...previousValues] : [];
            previousValues.push(newSelectedOption.value);
          }
        }
        return previousValues;
      });
    },
    [onSelect, options]
  );

  return (
    <Select
      selected={selected}
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
            itemId={option.key}
            description={option.description}
            hasCheck
            isSelected={selectedOptions.includes(option)}
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
