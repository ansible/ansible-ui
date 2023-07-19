import { SelectOptionObject, Split, SplitItem, ToolbarGroup } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { ToolbarFilterType } from '../PageToolbarFilter';
import DateInput from './Date';
import { ToolbarFilterCommon } from './ToolbarFilterCommon';

export interface IToolbarDateFilter2 extends ToolbarFilterCommon {
  type: ToolbarFilterType.Date;
}

export interface IToolbarDateFilterProps {
  id?: string;
  label?: string;
  placeholder?: string;
  value: string;
  addFilter: (value: string) => void;
  removeFilter: (value: string) => void;
  options: { label: string; value: string; isCustomDate?: boolean }[];
  isRequired?: boolean;
  defaultValue?: string;
}

/** Converts a single string value to a start and end date. */
export function filterValueToDateRange(value: string): [string | undefined, string | undefined] {
  const parts = value.split(',');
  switch (parts.length) {
    case 1:
      return [parts[0], undefined];
    case 2:
      return [parts[0], parts[1]];
    default:
      return [undefined, undefined];
  }
}

/** Converts a start and end date to a single string value. */
export function dateRangeToFilterValue(start: string | undefined, end: string | undefined) {
  if (start && end) {
    return `${start},${end}`;
  }
  if (start) {
    return start;
  }
  if (end) {
    return `,${end}`;
  }
  return '';
}

const today = (days = 0): Date => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(0, 0, 0, 0);
  return date;
};

const strToDate = (date: string): Date => {
  const nums = date.split('-');
  return new Date(+nums[0], +nums[1] - 1, +nums[2]);
};
type AttributeType = string | string[] | SelectOptionObject | SelectOptionObject[] | boolean;

export function ToolbarDateFilter(props: {
  endDate: string;
  startDate: string;
  setFilters: (type: string | undefined, value: AttributeType | undefined) => void;
}) {
  const { t } = useTranslation();

  return (
    <ToolbarGroup variant="filter-group">
      <Split hasGutter>
        <SplitItem>
          <DateInput
            categoryKey="start_date"
            value={props.startDate}
            setValue={(e, value) => props.setFilters('start_date', value)}
            validators={[
              (date: Date) =>
                date > strToDate(props.endDate) ? t('Must not be after end date') : '',
            ]}
          />
        </SplitItem>
        <SplitItem style={{ paddingTop: '6px' }}>{t('to')}</SplitItem>
        <SplitItem>
          <DateInput
            categoryKey="end_date"
            value={props.endDate}
            setValue={(e, value) => props.setFilters('end_date', value)}
            validators={[
              (date: Date) => {
                if (date < strToDate(props.startDate)) return t('Must not be before start date');
                if (date > today()) return t('Must not be after today');
                return '';
              },
            ]}
          />
        </SplitItem>
      </Split>
    </ToolbarGroup>
  );
}
