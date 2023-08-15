import React, { FunctionComponent } from 'react';
import { DatePicker } from '@patternfly/react-core';

interface Props {
  categoryKey: string;
  value?: string;
  setValue?: (event: React.FormEvent<HTMLInputElement>, value: string) => void;
  validators?: ((date: Date) => string)[];
}

const DateInput: FunctionComponent<Props> = ({
  categoryKey,
  value = '',
  setValue = () => ({}),
  validators = [],
}) => {
  const optionsForCategories: {
    [key: string]: {
      type: string;
      name: string;
      hasChips: boolean;
      placeholder?: string;
    };
  } = {
    quick_date_range: {
      type: 'select',
      name: 'Date',
      placeholder: 'Filter by date',
      hasChips: false,
    },
    start_date: {
      type: 'date',
      name: 'Start date',
      hasChips: false,
    },
    end_date: {
      type: 'date',
      name: 'End date',
      hasChips: false,
    },
  };
  const options = optionsForCategories[categoryKey];
  return (
    <DatePicker
      aria-label={options.name}
      value={value}
      onChange={setValue}
      inputProps={{
        isReadOnly: true,
      }}
      {...validators}
    />
  );
};

export default DateInput;
