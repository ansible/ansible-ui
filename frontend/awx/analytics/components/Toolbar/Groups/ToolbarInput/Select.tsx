// TODO: The component converts all types to string.
// It should be able to use the correct type in the future for example number and number[].
import React, { FunctionComponent, useState } from 'react';
import {
  Tooltip,
  ToolbarFilter,
  Select as PFSelect,
  SelectOption,
  SelectVariant,
  ToolbarChip,
  SelectOptionObject,
} from '@patternfly/react-core';

import { handleCheckboxChips, handleSingleChips } from './helpers';
import { optionsForCategories } from '../../constants';
import styled from 'styled-components';

import { AttributeType, SelectOptionProps, SetValue } from '../../types';

const OptionSpan = styled('span')`
  display: block;
  overflow-x: hidden;
  text-overflow: ellipsis;
  max-width: 300px;
`;

interface Props {
  categoryKey: string;
  value: AttributeType;
  selectOptions: SelectOptionProps[];
  isVisible?: boolean;
  setValue: SetValue;
}

const renderValues = (values: SelectOptionProps[]) =>
  values &&
  values.map(({ key, value, description }) => (
    <SelectOption key={key} value={key} description={description} data-cy={key}>
      <Tooltip content={<div>{value}</div>}>
        <OptionSpan>{value}</OptionSpan>
      </Tooltip>
    </SelectOption>
  ));

const Select: FunctionComponent<Props> = ({
  categoryKey,
  value,
  selectOptions: nonTypedSelectOptions,
  isVisible = true,
  setValue,
}) => {
  const [expanded, setExpanded] = useState(false);
  const options = optionsForCategories[categoryKey];
  let selectOptions = nonTypedSelectOptions.map(
    ({ key, value, description }) => ({
      key: key?.toString(),
      value: value?.toString(),
      description: description?.toString(),
    })
  );

  const selectOptionsMasterCopy = selectOptions;

  selectOptions = selectOptions.slice(0, 500);

  const onDelete = (chip: string) => {
    if (Array.isArray(value)) {
      const keyToDelete = selectOptionsMasterCopy.find(
        ({ value }) => value === chip
      )?.key;

      const stringValues: string[] = value.map((i) => i.toString());
      const filteredArr = stringValues.filter((item) => item !== keyToDelete);
      setValue(filteredArr);
    } else {
      setValue(undefined);
    }
  };

  const onFilter = (_: unknown, textInput: string) => {
    if (textInput === '') return renderValues(selectOptions);
    return renderValues(
      selectOptionsMasterCopy
        .filter(({ value }) =>
          value.toString().toLowerCase().includes(textInput.toLowerCase())
        )
        .slice(0, 50)
    );
  };

  const handleChips = (): string[] => {
    if (
      (Array.isArray(value) && value.length === 0) ||
      typeof value === 'undefined'
    )
      return [];
    if (Array.isArray(value))
      return handleCheckboxChips(
        value.map((i) => i.toString()),
        selectOptionsMasterCopy
      );
    return handleSingleChips(value.toString(), selectOptions);
  };

  const onSelect = (_: unknown, selection: SelectOptionObject | string) => {
    if (Array.isArray(value)) {
      const stringValues: string[] = value.map((i) => i.toString());
      setValue(
        !stringValues.includes(selection.toString())
          ? [...stringValues, selection]
          : stringValues.filter((item) => item !== selection.toString())
      );
    } else {
      setValue(selection);
      setExpanded(false);
    }
  };

  return (
    <ToolbarFilter
      data-cy={categoryKey}
      key={categoryKey}
      showToolbarItem={isVisible}
      chips={options.hasChips ? handleChips() : []}
      categoryName={options.name}
      deleteChip={
        options.hasChips
          ? (_: unknown, chip: ToolbarChip | string) => onDelete(chip as string)
          : undefined
      }
    >
      <PFSelect
        variant={
          Array.isArray(value) ? SelectVariant.checkbox : SelectVariant.single
        }
        aria-label={options.name}
        onToggle={() => setExpanded(!expanded)}
        onSelect={onSelect}
        selections={value}
        isOpen={expanded}
        hasInlineFilter
        placeholderText={options.placeholder}
        onFilter={onFilter}
        maxHeight={'1000%'}
      >
        {renderValues(selectOptions)}
      </PFSelect>
    </ToolbarFilter>
  );
};

export default Select;
