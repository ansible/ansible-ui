import { Button, DatePicker, ToolbarItem, isValidDate } from '@patternfly/react-core';
import { TimesCircleIcon } from '@patternfly/react-icons';
import { useEffect, useRef, useState } from 'react';
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

  // UI-only end date while the start is cleared (not persisted in filterValues / URL).
  const [orphanEndDate, setOrphanEndDate] = useState<string | undefined>();

  // `from`/`to` are derived from filterValues (not local state) so externally-set
  // values — e.g. loading a saved report — are always reflected.
  const from =
    filterValues && filterValues.length > 1 && filterValues[1] ? filterValues[1] : undefined;
  const toInFilter = filterValues && filterValues.length > 2 ? filterValues[2] : undefined;
  const to = toInFilter ?? (from ? undefined : orphanEndDate);

  // Remembers the last custom range for preset ↔ Custom switching.
  const lastCustomRangeRef = useRef<{ from?: string; to?: string }>({});
  useEffect(() => {
    if (from) {
      setOrphanEndDate(undefined);
    }
  }, [from]);

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
      setOrphanEndDate(undefined);
      setFilterValues(() => [value]);
      return;
    }
    const remembered = lastCustomRangeRef.current;
    const newValues = [value];
    if (remembered.from) {
      newValues.push(remembered.from);
      if (remembered.to) newValues.push(remembered.to);
    } else {
      setOrphanEndDate(undefined);
    }
    setFilterValues(() => newValues);
  }

  function setFrom(value?: string) {
    if (!selectedOption) return;
    if (!value) {
      // Keep showing the end date (read-only) without polluting filter state with ''.
      const endToRemember = toInFilter ?? orphanEndDate;
      if (endToRemember) {
        lastCustomRangeRef.current = { from: undefined, to: endToRemember };
        setOrphanEndDate(endToRemember);
      } else {
        lastCustomRangeRef.current = { from: undefined, to: undefined };
        setOrphanEndDate(undefined);
      }
      setFilterValues(() => [selectedOption.value]);
      return;
    }
    setOrphanEndDate(undefined);
    const end = toInFilter ?? orphanEndDate;
    const newValues = end ? [selectedOption.value, value, end] : [selectedOption.value, value];
    setFilterValues(() => newValues);
  }

  function setTo(value?: string) {
    if (!selectedOption) return;
    if (!from) {
      if (!value) {
        lastCustomRangeRef.current = { from: undefined, to: undefined };
        setOrphanEndDate(undefined);
      }
      return;
    }
    if (value) {
      setOrphanEndDate(undefined);
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
