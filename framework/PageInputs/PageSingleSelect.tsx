import {
  Bullseye,
  Button,
  Divider,
  Flex,
  Icon,
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
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Scrollable } from '../components/Scrollable';
import { useOverridableState } from '../components/useOverridableState';
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
  value: ValueT | undefined | null;

  /** The function to set the selected value. */
  onSelect: (value: ValueT | null) => void;

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

  /** Indicates if the select is disabled */
  isDisabled?: string;

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
   * Function to load the label for a selected value.
   * This is used when the selected value option is not present in the options.
   * Used by `PageAsyncSingleSelect`.
   */
  queryLabel?: (value: ValueT) => ReactNode;

  toggle?: (toggleRef: React.Ref<MenuToggleElement>) => ReactNode;

  disableAutoSelect?: boolean;

  disableSortOptions?: boolean;
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
  const { id, icon, value, onSelect, options, placeholder, queryLabel } = props;

  const [open, setOpen] = useOverridableState(props.open ?? false, props.setOpen);
  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 1);
    }
  }, [open]);

  const [searchValue, setSearchValue] = useOverridableState(
    props.searchValue ?? '',
    props.setSearchValue
  );

  const selectListRef = useRef<HTMLDivElement>(null);

  const selectedOption = useMemo(
    () => options.find((option) => value === option.value),
    [options, value]
  );

  const selectedLabel = useMemo(() => {
    let selectedLabel: ReactNode = selectedOption?.label;
    if (!selectedLabel && value !== undefined && value !== '' && value !== null) {
      selectedLabel = queryLabel?.(value);
    }
    return selectedLabel;
  }, [queryLabel, selectedOption?.label, value]);

  const Toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <Tooltip content={props.isDisabled} trigger={props.isDisabled ? undefined : 'manual'}>
      <Flex flexWrap={{ default: 'nowrap' }}>
        <MenuToggle
          id={id}
          data-cy={id}
          ref={toggleRef}
          icon={icon ?? selectedOption?.icon}
          onClick={() => setOpen(!open)}
          isExpanded={open}
          isDisabled={!!props.isDisabled}
          style={{
            // add style to allow for tooltip to show on disabled
            pointerEvents: props.isDisabled ? 'unset' : undefined,
            cursor: props.isDisabled ? 'not-allowed' : undefined,
          }}
          onKeyDown={(event) => {
            switch (event.key) {
              case 'Tab':
              case 'Shift':
                break;
              default:
                event.preventDefault();
                if (event.key.length === 1) {
                  setSearchValue(event.key);
                }
                setOpen(true);
                setTimeout(() => {
                  if (searchRef.current) {
                    if (event.key.length === 1) {
                      searchRef.current.value = event.key + searchRef.current.value;
                    }
                  }
                }, 1);
                break;
            }
          }}
          isFullWidth
        >
          {selectedLabel ? selectedLabel : <span style={{ opacity: 0.7 }}>{placeholder}</span>}
        </MenuToggle>
        {!props.isRequired && selectedLabel && (
          <Button
            variant="control"
            onClick={() => {
              setOpen(false);
              onSelect(null);
              if (toggleRef !== null && 'current' in toggleRef) {
                toggleRef.current?.focus();
              }
            }}
          >
            <Icon size="md" style={{ opacity: 0.7 }}>
              <TimesIcon aria-hidden style={{ padding: 0, margin: 0 }} />
            </Icon>
          </Button>
        )}
      </Flex>
    </Tooltip>
  );

  const onSelectHandler = useCallback(
    (_: unknown, itemId: string | number | undefined) => {
      const newSelectedOption: PageSelectOption<ValueT> | undefined = options.find((option) => {
        if (option.key !== undefined) return option.key === itemId;
        else return option.label === itemId;
      });
      if (newSelectedOption) {
        onSelect(newSelectedOption.value);
        setOpen(false);
      }
    },
    [onSelect, options, setOpen]
  );

  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!open) {
      setSearchValue('');
    }
  }, [open, setSearchValue]);

  useEffect(() => {
    if (!props.disableAutoSelect && props.isRequired && !selectedOption && options.length === 1) {
      onSelect(options[0].value);
    }
  }, [onSelect, options, props.disableAutoSelect, props.isRequired, selectedOption]);

  const visibleOptions = useMemo(() => {
    let visibleOptions = options;
    if (!props.setSearchValue) {
      visibleOptions = visibleOptions.filter((option) => {
        if (searchValue === '') return true;
        else return option.label.toLowerCase().includes(searchValue.toLowerCase());
      });
    }
    if (!props.disableSortOptions) {
      visibleOptions = visibleOptions.sort((a, b) => {
        const lhs = a.label.toLowerCase();
        const rhs = b.label.toLowerCase();
        if (lhs < rhs) return -1;
        if (lhs > rhs) return 1;
        return 0;
      });
    }
    return visibleOptions;
  }, [options, props.disableSortOptions, props.setSearchValue, searchValue]);

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
    <PageSingleSelectContext.Provider value={{ open, setOpen }}>
      <Select
        id={`${id}-select`}
        selected={selectedOption}
        onSelect={onSelectHandler}
        isOpen={open}
        onOpenChange={setOpen}
        toggle={props.toggle ?? Toggle}
        popperProps={{ appendTo: () => document.body }}
        shouldFocusToggleOnSelect
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
                    <PageSingleSelectList searchRef={searchRef} options={groups[groupName]} />
                  </SelectGroup>
                ))}
              </>
            ) : (
              <PageSingleSelectList searchRef={searchRef} options={visibleOptions} />
            )}
          </ScrollableStyled>
        )}
        {props.footer && <MenuFooter>{props.footer}</MenuFooter>}
      </Select>
    </PageSingleSelectContext.Provider>
  );
}

export function PageSingleSelectList(props: {
  searchRef: React.RefObject<HTMLInputElement>;
  options: PageSelectOption<unknown>[];
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
            description={option.description}
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

export const PageSingleSelectContext = createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
}>({
  open: false,
  setOpen: () => {},
});

export function usePageSingleSelectContext() {
  return useContext(PageSingleSelectContext);
}
