import { Divider, MenuToggle, MenuToggleElement, SearchInput } from '@patternfly/react-core';
import { Select, SelectList, SelectOption } from '@patternfly/react-core/next';
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { PageSelectOption, getPageSelectOptions } from './PageSelectOption';
import './PageSingleSelect.css';

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

  const [searchValue, setSearchValue] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    setSearchValue('');
    if (isOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen]);

  const visibleOptions = useMemo(
    () =>
      options.filter((option) => {
        if (searchValue === '') return true;
        else return option.label.toLowerCase().includes(searchValue.toLowerCase());
      }),
    [options, searchValue]
  );

  return (
    <div className="page-single-select">
      <Select
        selected={selectedOption?.label}
        onSelect={onSelectHandler}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        toggle={Toggle}
        style={{ zIndex: isOpen ? 9999 : undefined, minWidth: 250 }}
      >
        {options.length > 10 && (
          <>
            <div style={{ marginLeft: 16, marginRight: 16, marginTop: 12, marginBottom: 12 }}>
              <SearchInput
                id={id ? `${id}-search` : undefined}
                ref={searchRef}
                value={searchValue}
                onChange={(_, value: string) => setSearchValue(value)}
                onClear={(event) => {
                  event.stopPropagation();
                  setSearchValue('');
                }}
              />
            </div>
            <Divider />
          </>
        )}
        <SelectList style={{ overflow: 'auto', maxHeight: '45vh' }}>
          {visibleOptions.map((option) => (
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
    </div>
  );
}

const Placedholder = styled.span`
  opacity: 0.7;
`;
