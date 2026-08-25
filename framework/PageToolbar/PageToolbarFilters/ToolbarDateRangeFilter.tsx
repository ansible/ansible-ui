import { Button, DatePicker, ToolbarItem, isValidDate } from '@patternfly/react-core';
import { TimesCircleIcon } from '@patternfly/react-icons';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { PageSingleSelect } from '../../PageInputs/PageSingleSelect';
import { ToolbarFilterType } from '../PageToolbarFilter';
import { ToolbarFilterCommon } from './ToolbarFilterCommon';

export interface IToolbarDateRangeFilter extends ToolbarFilterCommon {
  type: ToolbarFilterType.DateRange;
  options: IToolbarDateFilterOption[];
  isRequired?: boolean;
  defaultValue?: string;
  isPinned?: true;
}

interface IToolbarDateFilterOption {
  label: string;
  description?: string;
  value: string;
  isCustom?: boolean;
}

export enum DateRangeFilterPresets {
  LastHour = 'lastHour',
  Last24Hours = 'last24hours',
  LastWeek = 'last7days',
  LastMonth = 'last30days',
}

export interface IToolbarDateRangeFilterProps {
  id?: string;
  label?: string;
  placeholder: string;
  filterValues?: string[] | undefined;
  setFilterValues: (setter: (prevValues: string[] | undefined) => string[]) => void;
  options: IToolbarDateFilterOption[];
  isRequired?: boolean;
  defaultValue?: string;
}

export function ToolbarDateRangeFilter(props: IToolbarDateRangeFilterProps) {
  const { filterValues, id, setFilterValues, placeholder, isRequired, defaultValue } = props;

  const selectedValue = filterValues && filterValues.length > 0 ? filterValues[0] : undefined;
  const selectedOption = props.options.find((option) => option.value === selectedValue);

  if (isRequired && !selectedOption) {
    setFilterValues(() => [defaultValue ?? props.options[0].value]);
  }

  // `from`/`to` are derived directly from filterValues (not local state) so that
  // externally-set values — e.g. loading a saved report with a custom range —
  // are always reflected, not just the value present when this component first mounted.
  const from = filterValues && filterValues.length > 1 ? filterValues[1] : undefined;
  const to = filterValues && filterValues.length > 2 ? filterValues[2] : undefined;

  // Remembers the last custom range entered so it can be restored if the user
  // switches to a preset and back to Custom, without controlling the displayed
  // from/to values itself (those stay solely derived from filterValues above).
  const lastCustomRangeRef = useRef<{ from?: string; to?: string }>({});
  useEffect(() => {
    if (selectedOption?.isCustom && (from || to)) {
      lastCustomRangeRef.current = { from, to };
    }
  }, [selectedOption, from, to]);

  function onSelectChange(value: string | null) {
    if (value === null) {
      if (defaultValue) {
        setFilterValues(() => [defaultValue]);
      }
      return;
    }
    const option = props.options.find((option) => option.value === value);
    if (!option) return;
    if (!option.isCustom) {
      setFilterValues(() => [value]);
      return;
    }
    const remembered = lastCustomRangeRef.current;
    const newValues = [value];
    if (remembered.from) {
      newValues.push(remembered.from);
      if (remembered.to) newValues.push(remembered.to);
    }
    setFilterValues(() => newValues);
  }

  function setFrom(value?: string) {
    if (!selectedOption) return;
    if (!value) {
      // Keep "to" as-is when "from" is cleared — the "to" DatePicker becomes
      // read-only (see DateRange below) rather than losing its value.
      const newValues = to ? [selectedOption.value, '', to] : [selectedOption.value];
      setFilterValues(() => newValues);
      return;
    }
    const newValues = to ? [selectedOption.value, value, to] : [selectedOption.value, value];
    setFilterValues(() => newValues);
  }

  function setTo(value?: string) {
    // The "to" DatePicker is disabled until "from" is set (see DateRange below),
    // so `from` is always defined here.
    if (!selectedOption || !from) return;
    if (value) {
      setFilterValues(() => [selectedOption.value, from, value]);
      return;
    }
    setFilterValues(() => [selectedOption.value, from]);
  }

  return (
    <ToolbarItem>
      <PageSingleSelect
        value={selectedOption?.value ?? ''}
        id={id}
        onSelect={onSelectChange}
        options={props.options}
        placeholder={placeholder}
        disableSortOptions
      />
      {selectedOption && selectedOption.isCustom && (
        <DateRange to={to} setTo={setTo} from={from} setFrom={setFrom} />
      )}
    </ToolbarItem>
  );
}

export function DateRange(props: {
  to?: string;
  setTo: (value?: string) => void;
  from?: string;
  setFrom: (value?: string) => void;
}) {
  const { to, setTo, from, setFrom } = props;
  const { t } = useTranslation();

  const onFromChange = (_event: unknown, from: string) => {
    setFrom(from);
  };

  const onToChange = (_event: unknown, to: string) => {
    setTo(to);
  };

  const fromDate = from ? new Date(from) : undefined;

  const toValidator = (date: Date) =>
    fromDate
      ? isValidDate(fromDate) && date >= fromDate
        ? ''
        : t('The "to" date must be after the "from" date')
      : '';

  return (
    <>
      <DatePicker
        value={from}
        onChange={onFromChange}
        aria-label="Start date"
        placeholder="YYYY-MM-DD"
        data-cy="toolbar-date-picker"
        data-testid="toolbar-date-picker"
      />
      <div style={{ alignSelf: 'baseline', padding: 6 }}>{t('to')}</div>
      <DatePicker
        value={to}
        onChange={onToChange}
        isDisabled={!fromDate || !isValidDate(fromDate)}
        rangeStart={fromDate}
        validators={[toValidator]}
        aria-label="End date"
        placeholder={t('now')}
        invalidFormatText={t('Invalid date format')}
      />
      {to !== undefined && (
        <Button
          icon={<TimesCircleIcon />}
          variant="control"
          style={{ alignSelf: 'flex-start' }}
          onClick={() => setTo(undefined)}
          aria-label={t('Clear end date')}
          data-testid="toolbar-date-picker-clear-end-date"
        ></Button>
      )}
    </>
  );
}
