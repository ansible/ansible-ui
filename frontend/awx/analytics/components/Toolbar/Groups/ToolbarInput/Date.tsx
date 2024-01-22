import { DatePicker } from '@patternfly/react-core';
import React, { FunctionComponent } from 'react';
import { optionsForCategories } from '../../constants';

interface Props {
  categoryKey: string;
  value?: string;
  setValue?: (event: React.FormEvent<HTMLInputElement>, value: string) => void;
  otherProps?: {
    [x: string]: unknown;
  };
}

export const DateInput: FunctionComponent<Props> = ({
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
      // PF5 Upgrade - disabled as not supported in PF5
      // inputProps={{
      //   isReadOnly: true,
      // }}
      {...otherProps}
    />
  );
};
