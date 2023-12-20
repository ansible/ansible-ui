import {
  Select,
  SelectOption,
  SelectOptionObject,
  SelectVariant,
} from '@patternfly/react-core/deprecated';
import { useEffect, useState } from 'react';

/**
 * @deprecated
 */
export function ToolbarSelectFilterDeprecated(props: {
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
  isRequired?: boolean;
  defaultValue?: string;
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
  const renderOptions = (
    options: {
      label: string;
      description?: string;
      value: string;
    }[]
  ) =>
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

  useEffect(() => {
    if (props.isRequired && values.length === 0) {
      if (props.defaultValue) {
        addFilter(props.defaultValue);
      } else {
        addFilter(options[0].value);
      }
    }
  }, [addFilter, options, props.defaultValue, props.isRequired, values.length]);

  // The placeholder test will show the label if the label is defined and there are values selected, otherwise it will show the placeholder
  const placeholderText = props.label
    ? values.length
      ? props.label
      : props.placeholder
    : values.length
      ? undefined
      : props.placeholder;

  const onClear =
    !props.isRequired && props.hasClear
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
      onToggle={(_event, val) => setOpen(val)}
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
