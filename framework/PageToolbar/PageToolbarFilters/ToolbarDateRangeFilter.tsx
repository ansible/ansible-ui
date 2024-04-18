import { Button, DatePicker, ToolbarItem, isValidDate } from '@patternfly/react-core';
import { TimesCircleIcon } from '@patternfly/react-icons';
import { useEffect, useState } from 'react';
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
  const { filterValues, setFilterValues, placeholder, isRequired, defaultValue } = props;

  const selectedValue = filterValues && filterValues.length > 0 ? filterValues[0] : undefined;
  const selectedOption = props.options.find((option) => option.value === selectedValue);

  if (isRequired && !selectedOption) {
    setFilterValues(() => [defaultValue ?? props.options[0].value]);
  }

  function onSelectChange(value: string | null) {
    if (value === null) return;
    const option = props.options.find((option) => option.value === value);
    if (option) {
      setFilterValues(() => [value]);
    }
  }

  const [from, setFrom] = useState<string | undefined>(() => {
    if (filterValues && filterValues.length > 1) return filterValues[1];
    return undefined;
  });

  const [to, setTo] = useState<string | undefined>(() => {
    if (filterValues && filterValues.length > 2) return filterValues[2];
    return undefined;
  });

  useEffect(() => {
    if (selectedOption && selectedOption.isCustom) {
      const newValues = [selectedOption.value];
      if (from) {
        newValues.push(from);
        if (to) {
          newValues.push(to);
        }
      }
      setFilterValues(() => newValues);
    }
  }, [selectedOption, from, to, setFilterValues]);

  return (
    <ToolbarItem>
      <PageSingleSelect
        value={selectedOption?.value ?? ''}
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
          variant="control"
          style={{ alignSelf: 'flex-start' }}
          onClick={() => setTo(undefined)}
        >
          <TimesCircleIcon />
        </Button>
      )}
    </>
  );
}
