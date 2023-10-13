import { ToolbarGroup, ToolbarGroupVariant } from '@patternfly/react-core';
import { SelectOptionObject, SelectVariant } from '@patternfly/react-core/deprecated';
import { ToolbarFilterCommon } from '../../../../../framework/PageToolbar/PageToolbarFilters/ToolbarFilterCommon';
import { ToolbarSelectFilterDeprecated } from './ToolbarSelectFilterDeprecated';
import { ToolbarDateFilter } from './ToolbarDateFilter';

export interface IToolbarDateFilter extends ToolbarFilterCommon {
  /** Filter for filtering by user text input. */
  type: 'dateWithOptions';
}
const today = (days = 0): Date => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(0, 0, 0, 0);
  return date;
};

const getDateByDays = (days: number): string => today(days).toISOString().split(/T/)[0];

type AttributeType = string | string[] | SelectOptionObject | SelectOptionObject[] | boolean;

export function ToolbarDateFilterWithOptions(props: {
  filters: Record<string, AttributeType>;
  setFilters: (type: string | undefined, value: AttributeType | undefined) => void;
  values: {
    quick_date_range: { label: string; value: string }[];
    granularity: { label: string; value: string }[];
  };
}) {
  const endDate = props.filters.end_date || getDateByDays(0);
  const startDate = props.filters.start_date || getDateByDays(-30);

  return (
    <ToolbarGroup variant={ToolbarGroupVariant['filter-group']}>
      {props.values.granularity && (
        <ToolbarSelectFilterDeprecated
          values={[props.filters.granularity.toString()]}
          options={props.values.quick_date_range}
          addFilter={(value) => props.setFilters('granularity', value)}
          removeFilter={(value) => props.setFilters('granularity', value)}
          variant={SelectVariant.single}
        />
      )}
      <ToolbarSelectFilterDeprecated
        values={[props.filters.quick_date_range.toString()]}
        options={props.values.quick_date_range}
        addFilter={(value) => props.setFilters('quick_date_range', value)}
        removeFilter={(value) => props.setFilters('quick_date_range', value)}
        variant={SelectVariant.single}
      />
      {['custom', 'roi_custom'].includes(props.filters.quick_date_range.toString()) && (
        <ToolbarDateFilter
          endDate={endDate.toString()}
          startDate={startDate.toString()}
          setFilters={props.setFilters}
        />
      )}
    </ToolbarGroup>
  );
}
