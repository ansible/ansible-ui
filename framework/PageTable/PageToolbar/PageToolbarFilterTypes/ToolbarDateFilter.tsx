import React from 'react';
import {
  SplitItem,
  ToolbarGroup,
  Split,
  SelectOptionObject,
  ToolbarGroupVariant,
  SelectVariant,
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import DateInput from './Date';
import { ToolbarFilterCommon } from './ToolbarFilterCommon';
import { ToolbarSelectFilter } from './ToolbarSelectFilter';

export interface IToolbarDateFilter extends ToolbarFilterCommon {
  /** Filter for filtering by user text input. */
  type: 'date';
}
const today = (days = 0): Date => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(0, 0, 0, 0);
  return date;
};

const getDateByDays = (days: number): string => today(days).toISOString().split(/T/)[0];

const strToDate = (date: string): Date => {
  const nums = date.split('-');
  return new Date(+nums[0], +nums[1] - 1, +nums[2]);
};
type AttributeType = string | string[] | SelectOptionObject | SelectOptionObject[] | boolean;

export function ToolbarDateFilter(props: {
  filters: Record<string, AttributeType>;
  setFilters: (type: string | undefined, value: AttributeType | undefined) => void;
  values: {
    quick_date_range: { key: string; value: AttributeType }[];
    granularity: { key: string; value: AttributeType }[];
  };
}) {
  const endDate = props.filters.end_date || getDateByDays(0);
  const startDate = props.filters.start_date || getDateByDays(-30);
  const { t } = useTranslation();

  return (
    <ToolbarGroup variant={ToolbarGroupVariant['filter-group']}>
      {props.values.granularity && (
        <ToolbarSelectFilter
          values={[props.filters.granularity.toString()]}
          options={props.values.quick_date_range.map(
            (item: { key: string; value: AttributeType }) => {
              return { value: item.key, label: item.value.toString() };
            }
          )}
          addFilter={(value) => props.setFilters('granularity', value)}
          removeFilter={(value) => props.setFilters('granularity', value)}
        />
      )}
      <ToolbarSelectFilter
        values={[props.filters.quick_date_range.toString()]}
        options={props.values.quick_date_range.map(
          (item: { key: string; value: AttributeType }) => {
            return { value: item.key, label: item.value.toString() };
          }
        )}
        addFilter={(value) => props.setFilters('quick_date_range', value)}
        removeFilter={(value) => props.setFilters('quick_date_range', value)}
        variant={SelectVariant.single}
      />
      {['custom', 'roi_custom'].includes(props.filters.quick_date_range.toString()) && (
        <Split hasGutter>
          <SplitItem>
            <DateInput
              categoryKey="start_date"
              value={startDate.toString()}
              setValue={(e) => props.setFilters('start_date', e.toString())}
              validators={[
                (date: Date) =>
                  date > strToDate(endDate.toString()) ? t('Must not be after end date') : '',
              ]}
            />
          </SplitItem>
          <SplitItem style={{ paddingTop: '6px' }}>{t('to')}</SplitItem>
          <SplitItem>
            <DateInput
              categoryKey="end_date"
              value={endDate.toString()}
              setValue={(e) => props.setFilters('end_date', e.toString())}
              validators={[
                (date: Date) => {
                  if (date < strToDate(startDate.toString()))
                    return t('Must not be before start date');
                  if (date > today()) return t('Must not be after today');
                  return '';
                },
              ]}
            />
          </SplitItem>
        </Split>
      )}
    </ToolbarGroup>
  );
}
