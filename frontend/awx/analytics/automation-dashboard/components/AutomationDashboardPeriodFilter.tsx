import { IFilterState, IToolbarDateRangeFilter } from '@ansible/ansible-ui-framework';
import { PageSingleSelect } from '@ansible/ansible-ui-framework/PageInputs/PageSingleSelect';
import {
  Button,
  DatePicker,
  Flex,
  ToolbarItem,
  isValidDate,
  yyyyMMddFormat,
} from '@patternfly/react-core';
import { TimesCircleIcon } from '@patternfly/react-icons';
import { Dispatch, SetStateAction, useCallback, useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toCustomPeriodValues } from '../utils/filterStateUpdates';

/**
 * Parses a `YYYY-MM-DD` value as local midnight — the same way the PatternFly DatePicker parses
 * dates. `new Date('YYYY-MM-DD')` would be UTC midnight, which east of UTC falls after the local
 * midnight of the same day and makes a same-day range ("from" = "to") look invalid.
 */
function parseLocalDate(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

/** True for a complete, real `YYYY-MM-DD` date (not a partially typed or empty value). */
function isCompleteDate(value: string): boolean {
  const date = parseLocalDate(value);
  return isValidDate(date) && yyyyMMddFormat(date) === value;
}

export interface AutomationDashboardPeriodFilterProps {
  /** The period filter definition (presets, Custom option, default value). */
  filter: IToolbarDateRangeFilter;
  filterState: IFilterState;
  setFilterState: Dispatch<SetStateAction<IFilterState>>;
  /**
   * Called while the user edits the custom start date: `true` when the typed start date is empty
   * or incomplete (filterState still holds the previous range), `false` once it is complete.
   * The edit is discarded whenever `filterState[filter.key]` is replaced.
   */
  onStartDateIncompleteChange?: (isIncomplete: boolean) => void;
}

/**
 * Dashboard-local period control. `filterState[filter.key]` is the single source of truth —
 * `['preset']` or `['custom', from?, to?]` — so values set externally (loading a saved report
 * or filter set) are always reflected, not only the value present on mount.
 */
export function AutomationDashboardPeriodFilter(
  props: Readonly<AutomationDashboardPeriodFilterProps>
) {
  const { filter, filterState, setFilterState, onStartDateIncompleteChange } = props;
  const { key, options, isRequired, defaultValue } = filter;
  const labelId = useId();

  const filterValues = filterState[key];
  const selectedValue = filterValues?.[0];
  const selectedOption = options.find((option) => option.value === selectedValue);
  const from = filterValues && filterValues.length > 1 ? filterValues[1] : undefined;
  const to = filterValues && filterValues.length > 2 ? filterValues[2] : undefined;

  const setPeriod = useCallback(
    (values: string[]) => setFilterState((prev) => ({ ...prev, [key]: values })),
    [key, setFilterState]
  );

  // A required period always has a selection — fall back to the default (or first) option.
  const fallbackValue = defaultValue ?? options[0]?.value;
  useEffect(() => {
    if (isRequired && !selectedOption && fallbackValue) {
      setPeriod([fallbackValue]);
    }
  }, [isRequired, selectedOption, fallbackValue, setPeriod]);

  // Remembers the last custom range so it can be restored when the user switches to a
  // preset and back to Custom. The displayed from/to stay derived from filterState.
  // Only a range with a start date is remembered: a range without one (e.g. ['custom', '', to]
  // from an old URL or saved report) must not overwrite the last usable range.
  const lastCustomRangeRef = useRef<{ from?: string; to?: string }>({});
  useEffect(() => {
    if (selectedOption?.isCustom && from) {
      lastCustomRangeRef.current = { from, to };
    }
  }, [selectedOption, from, to]);

  const onSelectChange = (value: string | null) => {
    if (value === null) {
      if (defaultValue) setPeriod([defaultValue]);
      return;
    }
    const isCustom = options.some((option) => option.value === value && option.isCustom);
    if (!isCustom) {
      setPeriod([value]);
      return;
    }
    const remembered = lastCustomRangeRef.current;
    const newValues = [value];
    if (remembered.from) {
      newValues.push(remembered.from);
      if (remembered.to) newValues.push(remembered.to);
    }
    setPeriod(newValues);
  };

  return (
    <ToolbarItem
      role="group"
      aria-labelledby={labelId}
      data-testid="automation-dashboard-period-filter"
      // Below `lg` (992px) the whole period takes its own row (PatternFly breakpoint utilities).
      className="pf-v6-u-w-100-on-md pf-v6-u-w-auto-on-lg"
      style={{ minWidth: 0, maxWidth: '100%' }}
    >
      {/* Below `md` (filters collapsed behind the filter toggle) the dropdown and the date range
          each get their own row; from `md` up they share a row and wrap when it gets too narrow.
          The flex layout lives on an inner element: a `display` on the ToolbarItem itself would
          override PatternFly hiding it while the toggle group is collapsed. */}
      <Flex
        data-testid="automation-dashboard-period-layout"
        direction={{ default: 'column', md: 'row' }}
        flexWrap={{ default: 'nowrap', md: 'wrap' }}
        alignItems={{ default: 'alignItemsFlexStart', md: 'alignItemsCenter' }}
        gap={{ default: 'gapSm' }}
      >
        <Flex
          flexWrap={{ default: 'nowrap' }}
          alignItems={{ default: 'alignItemsCenter' }}
          gap={{ default: 'gapSm' }}
        >
          <span id={labelId} className="pf-v6-u-text-nowrap">
            {filter.label}
          </span>
          <PageSingleSelect
            id={`${key}-filter`}
            value={selectedOption?.value ?? ''}
            onSelect={onSelectChange}
            options={options}
            placeholder={filter.placeholder ?? ''}
            disableSortOptions
          />
        </Flex>
        {selectedOption?.isCustom && (
          <PeriodDateRange
            periodValues={filterValues}
            customValue={selectedOption.value}
            from={from}
            to={to}
            setPeriod={setPeriod}
            onStartDateIncompleteChange={onStartDateIncompleteChange}
          />
        )}
      </Flex>
    </ToolbarItem>
  );
}

function PeriodDateRange(
  props: Readonly<{
    /** `filterState.period`; a new array (even with the same dates) discards the typed start. */
    periodValues?: string[];
    /** The value of the Custom option (`filterState.period[0]`). */
    customValue: string;
    from?: string;
    to?: string;
    setPeriod: (values: string[]) => void;
    onStartDateIncompleteChange?: (isIncomplete: boolean) => void;
  }>
) {
  const { periodValues, customValue, from, to, setPeriod, onStartDateIncompleteChange } = props;
  const { t } = useTranslation();

  // The start date input keeps what the user typed. Only a complete start date reaches
  // filterState, so an empty or partially typed start date sends no request and is not stored
  // (URL, saved report) — filterState keeps the last usable range until a new start is given.
  const [startInput, setStartInput] = useState(from ?? '');
  // Follow a period set from outside (saved report loaded, range restored) — also when it has
  // the same start date as before, so a cleared start date shows the loaded one again.
  const [shownPeriod, setShownPeriod] = useState(periodValues);
  if (periodValues !== shownPeriod) {
    setShownPeriod(periodValues);
    setStartInput(from ?? '');
  }

  const setFrom = (value: string) => {
    setStartInput(value);
    const isComplete = isCompleteDate(value);
    onStartDateIncompleteChange?.(!isComplete);
    if (isComplete) setPeriod(toCustomPeriodValues(customValue, value, to));
  };
  const setTo = (value?: string) => setPeriod(toCustomPeriodValues(customValue, from, value));

  // The end date is editable only once the start date is complete (and therefore stored).
  const isFromValid = isCompleteDate(startInput);
  const fromDate = isFromValid ? parseLocalDate(startInput) : undefined;

  const toValidator = (date: Date) => {
    if (!fromDate) return '';
    return isFromValid && date >= fromDate ? '' : t('The "to" date must be after the "from" date');
  };

  // Date pickers align to the top so their validation text below the input does not shift the row;
  // "from" and "to" wrap onto separate lines when the date row itself is too narrow.
  return (
    <Flex
      data-testid="automation-dashboard-period-date-range"
      flexWrap={{ default: 'wrap' }}
      alignItems={{ default: 'alignItemsFlexStart' }}
      gap={{ default: 'gapSm' }}
    >
      <DatePicker
        value={startInput}
        onChange={(_event, value) => setFrom(value)}
        aria-label={t('Start date')}
        placeholder="YYYY-MM-DD"
        data-cy="toolbar-date-picker"
        data-testid="toolbar-date-picker"
      />
      {/* Baseline alignment lines "to" up with the date input text without pixel offsets. */}
      <Flex
        flexWrap={{ default: 'nowrap' }}
        alignItems={{ default: 'alignItemsBaseline' }}
        gap={{ default: 'gapSm' }}
      >
        <span className="pf-v6-u-text-nowrap">{t('to')}</span>
        <DatePicker
          value={to}
          onChange={(_event, value) => setTo(value)}
          isDisabled={!isFromValid}
          rangeStart={fromDate}
          validators={[toValidator]}
          aria-label={t('End date')}
          placeholder={t('now')}
          invalidFormatText={t('Invalid date format')}
        />
        {/* Without a "from" the "to" picker is read-only, so its clear button is hidden too. */}
        {isFromValid && to !== undefined && (
          <Button
            icon={<TimesCircleIcon />}
            variant="control"
            onClick={() => setTo()}
            aria-label={t('Clear end date')}
            data-testid="period-filter-clear-end-date"
          />
        )}
      </Flex>
    </Flex>
  );
}
