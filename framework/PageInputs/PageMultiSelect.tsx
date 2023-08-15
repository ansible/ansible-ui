import {
  Chip,
  ChipGroup,
  MenuToggle,
  MenuToggleElement,
  SearchInput,
} from '@patternfly/react-core';
import { Select, SelectList, SelectOption } from '@patternfly/react-core/next';
import { TimesIcon } from '@patternfly/react-icons';
import { ReactNode, Ref, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './PageMultiSelect.css';
import './PageSelect.css';
import { PageSelectOption } from './PageSelectOption';

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

  /** The footer to show at the bottom of the dropdown. */
  footer?: ReactNode;

  /** Whether to disable the clear selection button. */
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
  ValueT
>(props: PageMultiSelectProps<ValueT>) {
  const { t } = useTranslation();
  const { id, icon, placeholder, values, onSelect, options, variant, disableClearSelection } =
    props;
  const [isOpen, setIsOpen] = useState(false);

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

  const Toggle = (toggleRef: Ref<MenuToggleElement>) => {
    return (
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
      >
        {icon && <span style={{ paddingLeft: 4, paddingRight: 12 }}>{icon}</span>}
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
                    size="sm"
                  />
                )}
              </>
            )}
          </>
        ) : (
          <span className="page-select-placeholder">{placeholder}</span>
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

  const showSearch = useMemo(
    () => visibleOptions.length > 10 || searchValue,
    [searchValue, visibleOptions.length]
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
        {showSearch && (
          <div className="page-select-header">
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
        )}
        {visibleOptions.length === 0 ? (
          <div style={{ margin: 16 }}>{t('No results found')}</div>
        ) : (
          <SelectList className="page-select-list">
            {visibleOptions.map((option) => (
              <SelectOption
                key={option.key !== undefined ? option.key : option.label}
                itemId={option.key !== undefined ? option.key : option.label}
                description={
                  option.description ? (
                    <div style={{ maxWidth: 300 }}>{option.description}</div>
                  ) : undefined
                }
                hasCheck
                isSelected={selectedOptions.includes(option)}
              >
                {option.label}
              </SelectOption>
            ))}
          </SelectList>
        )}
        {props.footer && <div className="page-select-footer">{props.footer}</div>}
      </Select>
    </div>
  );
}
