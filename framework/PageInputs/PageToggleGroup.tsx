import { ToggleGroup, ToggleGroupItem } from '@patternfly/react-core';
import { useEffect } from 'react';
import { PageSelectOption } from './PageSelectOption';

export interface PageToggleGroupProps<ValueT> {
  id?: string;
  value: ValueT | undefined;
  onSelect: (value: ValueT) => void;
  options: PageSelectOption<ValueT>[];
}

export function PageToggleGroup<ValueT>(props: PageToggleGroupProps<ValueT>) {
  const { id, value, onSelect, options } = props;
  useEffect(() => {
    if (!options.find((option) => value === option.value) && options.length > 0) {
      setTimeout(() => onSelect(options[0].value), 0);
    }
  }, [onSelect, options, value]);
  return (
    <ToggleGroup id={id}>
      {options.map((option, index) => (
        <ToggleGroupItem
          key={index}
          text={option.label}
          isSelected={value === option.value}
          onClick={() => onSelect(option.value)}
        />
      ))}
    </ToggleGroup>
  );
}
