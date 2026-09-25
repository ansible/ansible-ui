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
    const firstOption = options[0];
    if (!options.some((option) => value === option.value) && firstOption) {
      setTimeout(() => onSelect(firstOption.value), 0);
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
