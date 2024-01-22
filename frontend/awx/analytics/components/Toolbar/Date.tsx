import { DatePicker } from '@patternfly/react-core';
import React, { FunctionComponent } from 'react';

interface Props {
  categoryKey: string;
  value?: string;
  setValue?: (event: React.FormEvent<HTMLInputElement>, value: string) => void;
  validators?: ((date: Date) => string)[];
}

export const DateInput: FunctionComponent<Props> = ({
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
      // PF5 Upgrade - disabled as not supported in PF5
      // inputProps={{
      //   isReadOnly: true,
      // }}
      {...validators}
    />
  );
};
