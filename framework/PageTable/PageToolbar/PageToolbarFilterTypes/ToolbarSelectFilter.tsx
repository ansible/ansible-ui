import { Select, SelectOption, SelectOptionObject, SelectVariant } from '@patternfly/react-core';
import { useState } from 'react';
import { useFrameworkTranslations } from '../../../useFrameworkTranslations';
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
}) {
  const [translations] = useFrameworkTranslations();
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
    if (filterText === '') return renderOptions(options);
    const lowercaseFilterText = filterText.toLowerCase();
    return renderOptions(
      options.filter((option) => option.label.toLowerCase().includes(lowercaseFilterText))
    );
  };

  let selections: string | string[] = values;
  if (props.variant === SelectVariant.single) {
    if (values.length > 0) {
      selections = values[0];
    } else {
      selections = '';
    }
  }

  return (
    <Select
      variant={variant ? variant : SelectVariant.checkbox}
      isOpen={open}
      onToggle={setOpen}
      selections={selections}
      onSelect={onSelect}
      hasPlaceholderStyle
      placeholderText={values.length ? translations.selectedText : props.placeholder}
      hasInlineFilter={props.hasSearch ?? props.options.length > 10}
      onFilter={onFilter}
      style={{ zIndex: open ? 400 : 0 }} // ZIndex 400 is needed for PF table stick headers
    >
      {renderOptions(options)}
    </Select>
  );
}
