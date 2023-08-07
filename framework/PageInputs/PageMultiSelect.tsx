import {
  Button,
  Chip,
  ChipGroup,
  MenuToggle,
  MenuToggleElement,
  SearchInput,
} from '@patternfly/react-core';
import { Select, SelectList, SelectOption } from '@patternfly/react-core/next';
import { TimesIcon } from '@patternfly/react-icons';
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import './PageMultiSelect.css';
import { PageSelectOption, getPageSelectOptions } from './PageSelectOption';

export interface PageMultiSelectProps<ValueT> {
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

  footer?: ReactNode;

  disableClearSelection?: boolean;
}

/** Multi-select component */
export function PageMultiSelect<ValueT>(props: PageMultiSelectProps<ValueT>) {
  const { t } = useTranslation();
  const { id, icon, placeholder, values, onSelect, variant, disableClearSelection } = props;
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
            <Chip isReadOnly={disableClearSelection} onClick={() => onSelect(() => [])}>
              {selectedOptions.length}
            </Chip>
          ) : (
            <>
              <ChipGroup>
                {selectedOptions.map((option) => (
                  <Chip key={option.label} isReadOnly>
                    {option.label}
                  </Chip>
                ))}
              </ChipGroup>
              {!disableClearSelection && (
                <Button
                  icon={<TimesIcon aria-hidden />}
                  variant="plain"
                  onClick={() => onSelect(() => [])}
                />
              )}
            </>
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
        <div
          style={{
            padding: '12px 16px 12px 16px',
            borderBottom: 'thin solid var(--pf-global--BorderColor--100)',
          }}
        >
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
        {props.footer && (
          <div
            style={{
              padding: '12px 16px 12px 16px',
              borderTop: 'thin solid var(--pf-global--BorderColor--100)',
            }}
          >
            {props.footer}
          </div>
        )}
      </Select>
    </div>
  );
}

const Placedholder = styled.span`
  opacity: 0.7;
`;
