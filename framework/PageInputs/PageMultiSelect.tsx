import {
  Chip,
  ChipGroup,
  Divider,
  MenuToggle,
  MenuToggleElement,
  SearchInput,
} from '@patternfly/react-core';
import { Select, SelectList, SelectOption } from '@patternfly/react-core/next';
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import './PageMultiSelect.css';
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
  const { t } = useTranslation();
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
    <div className="page-multi-select">
      <Select
        selected={selected}
        onSelect={onSelectHandler}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        toggle={Toggle}
        style={{ zIndex: isOpen ? 9999 : undefined }}
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
        {visibleOptions.length === 0 ? (
          <div style={{ margin: 16 }}>{t('No results found')}</div>
        ) : (
          <SelectList style={{ overflow: 'auto', maxHeight: '45vh' }}>
            {visibleOptions.map((option) => (
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
        )}
      </Select>
    </div>
  );
}

const Placedholder = styled.span`
  opacity: 0.7;
`;
