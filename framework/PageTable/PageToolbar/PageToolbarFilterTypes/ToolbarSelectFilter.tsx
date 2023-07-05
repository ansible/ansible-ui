import { Select, SelectOption, SelectOptionObject, SelectVariant } from '@patternfly/react-core';
import React, { useCallback, useState } from 'react';
import { useFrameworkTranslations } from '../../../useFrameworkTranslations';
import { ToolbarFilterCommon } from './ToolbarFilterCommon';
export interface IToolbarSelectFilterOption {
  /** The label to show for the option. */
  label: string;

  /** The description to show for the option. */
  description?: string;

  /** The value to use for the option. */
  value: string;
}
/** Filter for filtering by user selection of option. */
export interface IToolbarSelectFilter extends ToolbarFilterCommon {
  /** Filter for filtering by user selection of option. */
  type: 'select';

  /** The options to show in the select. */
  options: IToolbarSelectFilterOption[];
}

export function ToolbarSelectFilter(props: {
  addFilter: (value: string) => void;
  removeFilter: (value: string) => void;
  options: { label: string; value: string }[];
  values: string[];
  placeholder?: string;
  hasSearch?: boolean;
  variant?: SelectVariant;
}) {
  const [translations] = useFrameworkTranslations();
  const { addFilter, removeFilter, options, values, variant } = props;
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
  const onFilter = (_: unknown, textInput: string) => {
    if (textInput === '') return renderValues(options);
    return renderValues(
      options.filter((option) =>
        option.label.toString().toLowerCase().includes(textInput.toLowerCase())
      )
    );
  };
  const renderValues = (options: IToolbarSelectFilterOption[]) =>
    options &&
    options.map((option) => (
      <SelectOption id={option.value} key={option.value} value={option.value}>
        {option.label}
      </SelectOption>
    ));
  const selections = values;
  return (
    <>
      <Select
        variant={variant ? variant : SelectVariant.checkbox}
        isOpen={open}
        onToggle={setOpen}
        selections={selections}
        onSelect={onSelect}
        placeholderText={values.length ? translations.selectedText : props.placeholder}
        // ZIndex 400 is needed for PF table stick headers
        style={{ zIndex: open ? 400 : 0 }}
        hasPlaceholderStyle
        onFilter={onFilter}
        hasInlineFilter={props.hasSearch}
      >
        {renderValues(options)}
      </Select>
    </>
  );
}
