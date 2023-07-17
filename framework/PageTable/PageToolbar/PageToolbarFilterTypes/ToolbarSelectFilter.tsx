import { Select, SelectOption, SelectOptionObject, SelectVariant } from '@patternfly/react-core';
import { useState } from 'react';
import { ToolbarFilterType } from '../PageToolbarFilter';
import { ToolbarFilterCommon } from './ToolbarFilterCommon';

/** A filter that allows the user to select a single option from a list of options. */
export interface IToolbarSingleSelectFilter extends ToolbarFilterCommon {
  type: ToolbarFilterType.SingleSelect;
  options: IToolbarFilterOption[];
  hasSearch?: boolean;
  onSearchTextChange?: (searchText: string) => void;
}

/** A filter that allows the user to select multiple options from a list of options. */
export interface IToolbarMultiSelectFilter extends ToolbarFilterCommon {
  type: ToolbarFilterType.MultiSelect;
  options: IToolbarFilterOption[];
  hasSearch?: boolean;
  onSearchTextChange?: (searchText: string) => void;
}

export interface IToolbarFilterOption {
  /** The label to show for the option. */
  label: string;

  /** The description to show for the option. */
  description?: string;

  /** The value to use for the option. */
  value: string;
}

export function ToolbarSelectFilter(props: {
  id?: string;
  addFilter: (value: string) => void;
  removeFilter: (value: string) => void;
  options: { label: string; value: string }[];
  values: string[];
  placeholder?: string;
  hasSearch?: boolean;
  variant?: SelectVariant;
  onSearchTextChange?: (text: string) => void;
  label?: string;
  hasClear?: boolean;
}) {
  const { addFilter, removeFilter, options, values, variant } = props;
  const [open, setOpen] = useState(false);

  const onSelect = (_: unknown, value: string | SelectOptionObject) => {
    if (props.variant === SelectVariant.single) {
      for (const value of values) {
        removeFilter(value);
      }
      addFilter(value.toString());
      setOpen(false);
    } else {
      if (values.includes(value.toString())) {
        removeFilter(value.toString());
      } else {
        addFilter(value.toString());
      }
    }
  };

  // render options is user for rendering both the options in the select and the select filter
  const renderOptions = (options: IToolbarFilterOption[]) =>
    options.map((option) => (
      <SelectOption
        id={option.value}
        key={option.value}
        value={option.value}
        description={option.description}
      >
        {option.label}
      </SelectOption>
    ));

  const onFilter = (_: unknown, filterText: string) => {
    props.onSearchTextChange?.(filterText);
    if (filterText === '') return renderOptions(options);
    const lowercaseFilterText = filterText.toLowerCase();
    return renderOptions(
      options.filter((option) => option.label.toLowerCase().includes(lowercaseFilterText))
    );
  };

  let selections: string | string[] | undefined = values;
  if (props.variant === SelectVariant.single) {
    if (values.length > 0) {
      selections = values[0];
    } else {
      selections = undefined;
    }
  }

  // The placeholder test will show the label if the label is defined and there are values selected, otherwise it will show the placeholder
  const placeholderText = props.label
    ? values.length
      ? props.label
      : props.placeholder
    : values.length
    ? undefined
    : props.placeholder;

  const onClear = props.hasClear
    ? () => {
        for (const value of values) {
          removeFilter(value);
        }
      }
    : undefined;

  return (
    <Select
      variant={variant ? variant : SelectVariant.checkbox}
      isOpen={open}
      onToggle={setOpen}
      selections={selections}
      onSelect={onSelect}
      hasPlaceholderStyle
      placeholderText={placeholderText}
      hasInlineFilter={props.hasSearch ?? props.options.length > 4}
      onFilter={onFilter}
      style={{ zIndex: open ? 400 : 0, minWidth: 200 }} // ZIndex 400 is needed for PF table stick headers
      onClear={onClear}
    >
      {renderOptions(options)}
    </Select>
  );
}
