import { DatePicker, ToolbarItem, isValidDate } from '@patternfly/react-core';
import { SelectOption } from '@patternfly/react-core/next';
import { useEffect, useState } from 'react';
import { PageSingleSelect } from '../../../PageInputs/PageSingleSelect';
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

export interface IToolbarDateRangeFilterProps {
  id?: string;
  label?: string;
  placeholder?: string;
  value: string;
  setValue: (value: string) => void;
  options: IToolbarDateFilterOption[];
  isRequired?: boolean;
  defaultValue?: string;
}

export function ToolbarDateRangeFilter(props: IToolbarDateRangeFilterProps) {
  const { value, setValue, placeholder } = props;
  let selectedOption = props.options.find((option) => option.value === value);
  if (!selectedOption) selectedOption = props.options.find((option) => option.isCustom);

  useEffect(() => {
    if (props.isRequired && !value) {
      setValue(props.defaultValue || props.options[0].value);
    }
  }, [props.isRequired, props.defaultValue, props.options, setValue, value]);

  function onSelectChange(value: string) {
    const option = props.options.find((option) => option.value === value);
    if (option) {
      setValue(value);
    }
  }

  return (
    <ToolbarItem style={{}}>
      <PageSingleSelect
        value={selectedOption?.value ?? ''}
        onChange={onSelectChange}
        placeholder={placeholder}
      >
        {props.options.map((option) => (
          <SelectOption key={option.label} itemId={option.value} description={option.description}>
            {option.label}
          </SelectOption>
        ))}
      </PageSingleSelect>
      {selectedOption && selectedOption.isCustom && (
        <DateRange value={props.value} setValue={setValue} />
      )}
    </ToolbarItem>
  );
}

export function DateRange(props: { value: string; setValue: (value: string) => void }) {
  const { value, setValue } = props;

  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');

  useEffect(() => {
    let [from, to] = value.split(',');
    if (!from) from = '';
    if (!to) to = '';
    setFrom(from);
    setTo(to);
  }, [value]);

  useEffect(() => setValue(`${from},${to}`), [from, setValue, to]);

  const onFromChange = (_event: unknown, from: string) => {
    setFrom(from);
    // if (from && isValidDate(new Date(from))) {
    //   setTo(new Date(from.getDate() + 1));
    // } else {
    //   setTo(undefined);
    // }
  };

  const onToChange = (_event: unknown, to: string) => {
    setTo(to);
  };

  const fromDate = new Date(from);

  const toValidator = (date: Date) =>
    isValidDate(fromDate) && date >= fromDate ? '' : 'The "to" date must be after the "from" date';

  return (
    <>
      <DatePicker
        value=""
        onChange={onFromChange}
        aria-label="Start date"
        placeholder="YYYY-MM-DD"
      />
      <div style={{ margin: 'auto', paddingLeft: 4, paddingRight: 4 }}>to</div>
      <DatePicker
        value={to}
        onChange={onToChange}
        isDisabled={!isValidDate(fromDate)}
        rangeStart={fromDate}
        validators={[toValidator]}
        aria-label="End date"
        placeholder="YYYY-MM-DD"
      />
    </>
  );
}
