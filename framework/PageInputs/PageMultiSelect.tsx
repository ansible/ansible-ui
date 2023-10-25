import {
  Chip,
  ChipGroup,
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

import { TimesIcon } from '@patternfly/react-icons';
import { ReactNode, Ref, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getID } from '../hooks/useID';
import { PageSelectOption } from './PageSelectOption';

export interface PageMultiSelectProps<ValueT> {
  /** The ID of the select. */
  id?: string;

  /** The icon to show in the select. */
  icon?: ReactNode;

  /** The placeholder to show when no values are selected. */
  placeholder: ReactNode;

  /** Disables the toggle to open and close the menu */
  isDisabled?: boolean;

  /** The selected values. */
  values: ValueT[] | undefined | null;

  /** The function to set the selected values. */
  onSelect: (setter: (currentValues: ValueT[] | undefined) => ValueT[] | undefined) => void;

  /** The options to select from. */
  options: PageSelectOption<ValueT>[];

  /** The variant of the select. */
  variant?: 'chips' | 'count';

  /** The footer to show at the bottom of the dropdown. */
  footer?: ReactNode;

  /**
   * Whether to disable the clear selection button.
   *
   * User by the toolbar since clearing the select is part of the toolbar filter chips already.
   */
  disableClearSelection?: boolean;
}

/**
 * Select dropdown component for multiple selection of options.
 *
 * @param props The props of the component. See `PageMultiSelectProps`.
 *
 * This is a wrapper over PatternFly's `Select` component,
 * simplifying the API and adding some features:
 * - `values`, `onSelect`, and `options` are typed.
 * - `options` can be an array of strings, numbers or objects with `label` and `value` properties.
 *
 * This component also adds a search input and footer to the dropdown.
 *
 * Typeahead is supported by the component opening and searching when the user types.
 *
 * Used by:
 * - `PageAsyncMultiSelect`
 * - `PageFormMultiSelect`
 * - `PageFormAsyncMultiSelect` via PageAsyncMultiSelect
 * - `IFilterMultiSelect`
 * - `IFilterAsyncMultiSelect` via PageAsyncMultiSelect
 *
 * @example
 * return (
 *   <PageMultiSelect
 *     placeholder="Select options"
 *     values={values}
 *     onSelect={setValues}
 *     options={[
 *       { label: 'Option 1', value: 1 },
 *       { label: 'Option 2', value: 2 }
 *     ]}
 *   />
 * )
 */
export function PageMultiSelect<
  /** The type of the value of the select and of the options values. */
  ValueT,
>(props: PageMultiSelectProps<ValueT>) {
  const { t } = useTranslation();
  const { id, icon, placeholder, values, onSelect, options, variant, disableClearSelection } =
    props;
  const [isOpen, setIsOpen] = useState(false);

  const selectedOptions = useMemo(
    () =>
      options.filter((option: PageSelectOption<ValueT>) => {
        if (values === undefined || values === null) {
          return false;
        }
        return values.includes(option.value);
      }),
    [options, values]
  );

  const Toggle = (toggleRef: Ref<MenuToggleElement>) => {
    return (
      <MenuToggle
        isFullWidth
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
        icon={icon}
        isDisabled={props.isDisabled}
      >
        {selectedOptions.length > 0 ? (
          <>
            {variant === 'count' ? (
              <Chip
                isReadOnly={disableClearSelection}
                onClick={() => onSelect(() => [])}
                style={{ marginTop: -2, marginBottom: -2 }}
              >
                {selectedOptions.length}
              </Chip>
            ) : (
              <>
                <ChipGroup>
                  {selectedOptions.map((option) => (
                    <Chip key={option.label} isReadOnly style={{ marginTop: -2, marginBottom: -2 }}>
                      {option.label}
                    </Chip>
                  ))}
                </ChipGroup>
                {!disableClearSelection && (
                  <TimesIcon
                    role="button"
                    aria-hidden
                    onClick={() => onSelect(() => [])}
                    style={{ verticalAlign: 'middle', marginLeft: 8 }}
                  />
                )}
              </>
            )}
          </>
        ) : (
          <span style={{ opacity: 0.7 }}>{placeholder}</span>
        )}
      </MenuToggle>
    );
  };

  const selected = useMemo(() => selectedOptions.map((option) => option.label), [selectedOptions]);

  const onSelectHandler = useCallback(
    (_: unknown, itemId: string | number | undefined) => {
      onSelect((previousValues: ValueT[] | undefined) => {
        const newSelectedOption = options.find((option) => {
          if (option.key !== undefined) return option.key === itemId;
          else return option.label === itemId;
        });
        if (newSelectedOption) {
          if (previousValues?.find((value) => value === newSelectedOption.value) !== undefined) {
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
    <Select
      id={`${id}-select`}
      selected={selected}
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
                description={
                  option.description ? (
                    <div style={{ maxWidth: 300 }}>{option.description}</div>
                  ) : undefined
                }
                hasCheckbox
                isSelected={selectedOptions.includes(option)}
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
