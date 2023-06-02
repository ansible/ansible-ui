import { Select, SelectOption, SelectOptionObject, SelectVariant } from '@patternfly/react-core';
import { useCallback, useState } from 'react';
import { useFrameworkTranslations } from '../../../useFrameworkTranslations';
import { ToolbarFilterCommon } from './ToolbarFilterCommon';
/** Filter for filtering by user selection of option. */
export interface IToolbarSelectFilter extends ToolbarFilterCommon {
  /** Filter for filtering by user selection of option. */
  type: 'select';

  /** The options to show in the select. */
  options: {
    /** The label to show for the option. */
    label: string;

    /** The description to show for the option. */
    description?: string;

    /** The value to use for the option. */
    value: string;
  }[];
}

export function ToolbarSelectFilter(props: {
  addFilter: (value: string) => void;
  removeFilter: (value: string) => void;
  options: { label: string; value: string }[];
  values: string[];
  placeholder?: string;
}) {
  const [translations] = useFrameworkTranslations();
  const { addFilter, removeFilter, options, values } = props;
  const [open, setOpen] = useState(false);
  const onSelect = useCallback(
    (e: unknown, value: string | SelectOptionObject) => {
      if (values.includes(value.toString())) {
        removeFilter(value.toString());
      } else {
        addFilter(value.toString());
      }
    },
    [addFilter, removeFilter, values]
  );
  const selections = values;
  return (
    <>
      <Select
        variant={SelectVariant.checkbox}
        isOpen={open}
        onToggle={setOpen}
        selections={selections}
        onSelect={onSelect}
        placeholderText={values.length ? translations.selectedText : props.placeholder}
        // ZIndex 400 is needed for PF table stick headers
        style={{ zIndex: open ? 400 : 0 }}
        hasPlaceholderStyle
      >
        {options.map((option) => (
          <SelectOption id={option.value} key={option.value} value={option.value}>
            {option.label}
          </SelectOption>
        ))}
      </Select>
    </>
  );
}
