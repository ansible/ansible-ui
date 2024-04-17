import {
  Bullseye,
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
  SelectGroup,
  SelectList,
  SelectOption,
  Spinner,
  Tooltip,
} from '@patternfly/react-core';
import { TimesIcon } from '@patternfly/react-icons';
import { ReactNode, Ref, useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Scrollable } from '../components/Scrollable';
import { useOverridableState } from '../components/useOverridableState';
import { getID } from '../hooks/useID';
import { PageSelectOption } from './PageSelectOption';

export interface PageMultiSelectProps<ValueT> {
  /** The ID of the select. */
  id?: string;

  /** The icon to show in the select. */
  icon?: ReactNode;

  /** The placeholder to show when no values are selected. */
  placeholder: ReactNode;

  // TODO isDisabled should be a string
  /** Disables the toggle to open and close the menu */
  isDisabled?: string;

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
   * Indicates if the select is open.
   * Handled by the component if not provided.
   */
  open?: boolean;

  /**
   * The function to set the open state.
   * Handled by the component if not provided.
   */
  setOpen?: (open: boolean) => void;

  /**
   * The search value to filter the options.
   * Handled by the component if not provided.
   */
  searchValue?: string;

  /**
   * The function to set the search value.
   * Handled by the component if not provided.
   */
  setSearchValue?: (searchValue: string) => void;

  /**
   * Indicates if the select is loading.
   * This is a helper to show a loading spinner in the dropdown.
   * Used by `PageAsyncSingleSelect`.
   */
  isLoading?: boolean;

  /**
   * Whether to disable the clear selection button.
   *
   * User by the toolbar since clearing the select is part of the toolbar filter chips already.
   */
  disableClearSelection?: boolean;

  disableClearChips?: boolean;

  maxChipSize?: string;

  disableSortOptions?: boolean;

  queryLabel?: (value: ValueT) => ReactNode;
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
  const {
    id,
    icon,
    placeholder,
    values,
    onSelect,
    options,
    variant,
    disableClearSelection,
    maxChipSize,
    queryLabel,
  } = props;
  const [open, setOpen] = useOverridableState(props.open ?? false, props.setOpen);
  const [searchValue, setSearchValue] = useOverridableState(
    props.searchValue ?? '',
    props.setSearchValue
  );

  const selectListRef = useRef<HTMLDivElement>(null);

  const selectedOptions = useMemo(() => {
    const selectedOptions: PageSelectOption<ValueT>[] = [];
    for (const value of values ?? []) {
      const option = options.find((option) => option.value === value);
      if (option) {
        selectedOptions.push(option);
      } else if (queryLabel) {
        if (value !== undefined) {
          selectedOptions.push({ label: queryLabel(value) as string, value });
        }
      }
    }
    return selectedOptions;
  }, [options, queryLabel, values]);

  const Toggle = (toggleRef: Ref<MenuToggleElement>) => {
    return (
      <Tooltip content={props.isDisabled} trigger={props.isDisabled ? undefined : 'manual'}>
        <MenuToggle
          id={id}
          ref={toggleRef}
          onClick={() => setOpen(!open)}
          isExpanded={open}
          onKeyDown={(event) => {
            switch (event.key) {
              case 'Tab':
              case 'Enter':
              case 'Shift':
                break;
              default:
                setOpen(true);
                setTimeout(() => {
                  if (searchRef.current) {
                    searchRef.current.focus();
                    searchRef.current.value = event.key;
                  }
                }, 1);
                break;
            }
          }}
          data-cy={id}
          icon={icon}
          isDisabled={!!props.isDisabled}
          isFullWidth
          style={{ paddingTop: 2, paddingBottom: 4, minHeight: 36 }}
        >
          {selectedOptions.length > 0 ? (
            <>
              {variant === 'count' ? (
                <Chip
                  isReadOnly={disableClearSelection}
                  onClick={() => onSelect(() => [])}
                  style={{ marginTop: -4, marginBottom: -4 }}
                >
                  {selectedOptions.length}
                </Chip>
              ) : (
                <>
                  <ChipGroup numChips={99}>
                    {selectedOptions.map((option) => (
                      <Chip
                        key={option.label}
                        isReadOnly={props.disableClearChips}
                        textMaxWidth={maxChipSize}
                        style={{ marginTop: -2, marginBottom: -2 }}
                        onClick={() =>
                          onSelect((previousValues) =>
                            previousValues?.filter((v) => v !== option.value)
                          )
                        }
                      >
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
      </Tooltip>
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

  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!open) {
      setSearchValue('');
    }
  }, [open, setSearchValue]);

  const visibleOptions = useMemo(() => {
    const newOptions = options.filter((option) => {
      if (searchValue === '') return true;
      else return option.label.toLowerCase().includes(searchValue.toLowerCase());
    });
    if (!props.disableSortOptions) {
      newOptions.sort((a, b) => a.label.toLowerCase().localeCompare(b.label.toLowerCase()));
    }
    return newOptions;
  }, [options, props.disableSortOptions, searchValue]);

  const groups = useMemo(() => {
    const hasGroups = options.some((option) => !!option.group);
    if (hasGroups) {
      const groups: Record<string, PageSelectOption<ValueT>[]> = {};
      for (const option of visibleOptions) {
        const group = option.group ?? '';
        if (!groups[group]) groups[group] = [];
        groups[group].push(option);
      }
      return groups;
    }
  }, [options, visibleOptions]);

  return (
    <Select
      id={`${id}-select`}
      selected={selected}
      onSelect={onSelectHandler}
      isOpen={open}
      onOpenChange={setOpen}
      toggle={Toggle}
      popperProps={{ appendTo: () => document.body }}
      innerRef={selectListRef}
    >
      <MenuSearch>
        <MenuSearchInput data-cy="search-input">
          <SearchInput
            id={`${id}-search`}
            ref={searchRef}
            value={searchValue}
            onChange={(_, value: string) => setSearchValue(value)}
            onClear={(event) => {
              event.stopPropagation();
              setSearchValue('');
            }}
            resultsCount={
              visibleOptions.length !== options.length
                ? `${visibleOptions.length} / ${options.length}`
                : undefined
            }
            onKeyDown={(event) => {
              switch (event.key) {
                case 'ArrowDown':
                case 'Tab': {
                  event.preventDefault();
                  event.stopPropagation();
                  const firstElement = selectListRef?.current?.querySelector(
                    'li button:not(:disabled),li input:not(:disabled)'
                  );
                  firstElement && (firstElement as HTMLElement).focus();
                  break;
                }
              }
            }}
          />
        </MenuSearchInput>
      </MenuSearch>
      <Divider />
      {visibleOptions.length === 0 ? (
        <>
          {props.isLoading ? (
            <Bullseye style={{ padding: 16 }}>
              <Spinner size="lg" />
            </Bullseye>
          ) : (
            <SelectOption isDisabled key="no result">
              {t('No results found')}
            </SelectOption>
          )}
        </>
      ) : (
        <ScrollableStyled>
          {groups ? (
            <>
              {Object.keys(groups).map((groupName) => (
                <SelectGroup label={groupName} key={groupName}>
                  <PageMultiSelectList
                    searchRef={searchRef}
                    options={visibleOptions}
                    selectedOptions={selectedOptions}
                  />
                </SelectGroup>
              ))}
            </>
          ) : (
            <PageMultiSelectList
              searchRef={searchRef}
              options={visibleOptions}
              selectedOptions={selectedOptions}
            />
          )}
        </ScrollableStyled>
      )}
      {props.footer && <MenuFooter>{props.footer}</MenuFooter>}
    </Select>
  );
}

function PageMultiSelectList(props: {
  searchRef: React.RefObject<HTMLInputElement>;
  options: PageSelectOption<unknown>[];
  selectedOptions: PageSelectOption<unknown>[];
}) {
  return (
    <SelectList
      onKeyDown={(event) => {
        switch (event.key) {
          case 'Tab':
            event.preventDefault();
            event.stopPropagation();
            props.searchRef.current?.focus();
            break;
        }
      }}
    >
      {props.options.map((option) => {
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
            isSelected={props.selectedOptions.includes(option)}
            data-cy={optionId}
          >
            {option.label}
          </SelectOption>
        );
      })}
    </SelectList>
  );
}

const ScrollableStyled = styled(Scrollable)`
  max-height: 40vh;
`;
