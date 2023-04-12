import React, { FunctionComponent } from 'react';
import { DatePicker } from '@patternfly/react-core';
import { optionsForCategories } from '../../constants';

interface Props {
  categoryKey: string;
  value?: string;
  setValue?: (event: React.FormEvent<HTMLInputElement>, value: string) => void;
  otherProps?: {
    [x: string]: unknown;
  };
}

const DateInput: FunctionComponent<Props> = ({
  categoryKey,
  value = '',
  setValue = () => ({}),
  otherProps = {},
}) => {
  const options = optionsForCategories[categoryKey];
  return (
    <DatePicker
      aria-label={options.name}
      value={value}
      onChange={setValue}
      inputProps={{
        isReadOnly: true,
      }}
      {...otherProps}
    />
  );
};

export default DateInput;
