import React from 'react';
import { SplitItem, Split, SelectOptionObject, ToolbarGroup } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import DateInput from './Date';
import { ToolbarFilterCommon } from './ToolbarFilterCommon';

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
