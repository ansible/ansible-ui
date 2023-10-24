import {
  Divider,
  MenuFooter,
  MenuSearch,
  MenuSearchInput,
  MenuToggle,
  MenuToggleElement,
  SearchInput,
  Select,
  SelectList,
  SelectOption,
} from '@patternfly/react-core';
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getID } from '../hooks/useID';
import { PageSelectOption } from './PageSelectOption';

export interface PageSingleSelectProps<ValueT> {
  /** The ID of the select component. */
  id?: string;

  /** The icon to show in the select. */
  icon?: ReactNode;

  /** The placeholder to show when no value is selected. */
  placeholder: ReactNode;

  /** The selected value. */
  value: ValueT;

  /** The function to set the selected value. */
  onSelect: (value: ValueT) => void;

  /** The options to select from. */
  options: PageSelectOption<ValueT>[];

  /** The footer to show at the bottom of the dropdown. */
  footer?: ReactNode;

  /**
   * Whether the select required an option to be selected.
   *
   * If true, the select will autoselect the first option,
   * else the select will contain a clear button.
   */
  isRequired?: boolean;

  /** Disables the toggle to open and close the menu */
  isDisabled?: boolean;
}

/**
 * Select dropdown component for single selection of options.
 *
 * @param props The props of the component. See `PageSingleSelectProps`.
 *
 * This is a wrapper over PatternFly's `Select` component,
 * simplifying the API and adding some features:
 * - `value`, `onSelect`, and `options` are typed.
 * - `options` can be an array of strings, numbers or objects with `label` and `value` properties.
 *
 * This component also adds a search input and footer to the dropdown.
 *
 * Typeahead is supported by the component opening and searching when the user types.
 *
 * Used by:
 * - `PageAsyncSingleSelect`
 * - `PageFormSingleSelect`
 * - `PageFormAsyncSingleSelect` via PageAsyncSingleSelect
 * - `IFilterSingleSelect`
 * - `IFilterAsyncSingleSelect` via PageAsyncSingleSelect
 *
 * @example
 * return (
 *   <PageSingleSelect
 *     placeholder="Select option"
 *     value={value}
 *     onSelect={setValue}
 *     options={[
 *       { label: 'Option 1', value: 1 },
 *       { label: 'Option 2', value: 2 }
 *     ]}
 *   />
 * )
 */
export function PageSingleSelect<
  /** The type of the value of the select and of the options values. */
  ValueT,
>(props: PageSingleSelectProps<ValueT>) {
  const { t } = useTranslation();
  const { id, icon, value, onSelect, options, placeholder } = props;
  const [isOpen, setIsOpen] = useState(false);

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
      onKeyDown={(event) => {
        switch (event.key) {
          default:
            setIsOpen(true);
            break;
        }
      }}
      data-cy={id}
      icon={icon ?? selectedOption?.icon}
      isDisabled={props.isDisabled}
    >
      {selectedOption ? selectedOption.label : <span style={{ opacity: 0.7 }}>{placeholder}</span>}
    </MenuToggle>
  );

  const onSelectHandler = useCallback(
    (_: unknown, itemId: string | number | undefined) => {
      const newSelectedOption: PageSelectOption<ValueT> | undefined = options.find((option) => {
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

  useEffect(() => {
    if (props.isRequired && !selectedOption && options.length > 0) {
      onSelect(options[0].value);
    }
  }, [onSelect, options, props.isRequired, selectedOption]);

  const visibleOptions = useMemo(
    () =>
      options.filter((option) => {
        if (searchValue === '') return true;
        else return option.label.toLowerCase().includes(searchValue.toLowerCase());
      }),
    [options, searchValue]
  );

  return (
    <Select
      id={`${id}-select`}
      selected={selectedOption?.label}
      onSelect={onSelectHandler}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      toggle={Toggle}
      popperProps={{ appendTo: () => document.body }}
    >
      <MenuSearch>
        <MenuSearchInput>
          <SearchInput
            id={`${id}-search`}
            ref={searchRef}
            value={searchValue}
            onChange={(_, value: string) => setSearchValue(value)}
            onClear={(event) => {
              event.stopPropagation();
              setSearchValue('');
            }}
            resultsCount={`${visibleOptions.length} / ${options.length}`}
          />
        </MenuSearchInput>
      </MenuSearch>
      <Divider />
      {visibleOptions.length === 0 ? (
        <SelectOption isDisabled key="no result">
          {t('No results found')}
        </SelectOption>
      ) : (
        <SelectList style={{ maxHeight: '40vh', overflowY: 'auto' }}>
          {visibleOptions.map((option) => {
            const optionId = getID(option);
            return (
              <SelectOption
                id={optionId}
                icon={option.icon}
                key={option.key !== undefined ? option.key : option.label}
                value={option.key !== undefined ? option.key : option.label}
                description={option.description}
                data-cy={optionId}
              >
                {option.label}
              </SelectOption>
            );
          })}
        </SelectList>
      )}
      {props.footer && <MenuFooter>{props.footer}</MenuFooter>}
    </Select>
  );
}
