import React, { FunctionComponent } from 'react';
import {
  SplitItem,
  ToolbarGroup,
  Split,
  SelectOptionProps,
  ToolbarGroupVariant,
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';

import ToolbarInput from './ToolbarInput';

import { SetValues, AttributeType } from '../types';

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

interface Props {
  filters: Record<string, AttributeType>;
  setFilters: SetValues;
  values: {
    quick_date_range: SelectOptionProps[];
    granularity: SelectOptionProps[];
  };
}

const QuickDateGroup: FunctionComponent<Props> = ({ filters, setFilters, values }) => {
  const endDate = (filters.end_date as string) || getDateByDays(0);
  const startDate = (filters.start_date as string) || getDateByDays(-30);
  const { t } = useTranslation();

  return (
    <ToolbarGroup variant={ToolbarGroupVariant['filter-group']}>
      {values.granularity && (
        <ToolbarInput
          categoryKey="granularity"
          value={filters.granularity}
          selectOptions={values.granularity}
          setValue={(value) => setFilters('granularity', value)}
        />
      )}
      <ToolbarInput
        categoryKey="quick_date_range"
        value={filters.quick_date_range}
        selectOptions={values.quick_date_range}
        setValue={(value) => setFilters('quick_date_range', value)}
      />
      {['custom', 'roi_custom'].includes(filters.quick_date_range as string) && (
        <Split hasGutter>
          <SplitItem>
            <ToolbarInput
              categoryKey="start_date"
              value={startDate}
              setValue={(e) => setFilters('start_date', e)}
              validators={[
                (date: Date) => (date > strToDate(endDate) ? t('Must not be after end date') : ''),
              ]}
            />
          </SplitItem>
          <SplitItem style={{ paddingTop: '6px' }}>{t('to')}</SplitItem>
          <SplitItem>
            <ToolbarInput
              categoryKey="end_date"
              value={endDate}
              setValue={(e) => setFilters('end_date', e)}
              validators={[
                (date: Date) => {
                  if (date < strToDate(startDate)) return t('Must not be before start date');
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
};

export default QuickDateGroup;
