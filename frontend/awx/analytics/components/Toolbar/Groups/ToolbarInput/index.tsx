import { SelectOptionProps } from '@patternfly/react-core/deprecated';
import React, { FunctionComponent } from 'react';
import { optionsForCategories } from '../../constants';
import { AttributeType, SetValue } from '../../types';
import { DateInput } from './Date';
import { Select } from './Select';
import { Text } from './Text';

// Todo: unify the interfaces better so we don't have to use any
// and avoid accidentall wronglt passed props
interface ComponentMapper {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [x: string]: React.ComponentType<any>;
}

const components: ComponentMapper = {
  select: Select,
  date: DateInput,
  text: Text,
};

interface Props {
  categoryKey: string;
  value?: AttributeType;
  selectOptions?: SelectOptionProps[];
  isVisible?: boolean;
  setValue: SetValue;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [x: string]: any;
}

export const ToolbarInput: FunctionComponent<Props> = ({
  categoryKey,
  value,
  selectOptions,
  isVisible = true,
  setValue,
  ...otherProps
}) => {
  const options = optionsForCategories[categoryKey];
  const SelectedInput = components[options.type];

  const defaultValue = () => {
    if (value) {
      return value;
    } else if (options.type !== 'select') {
      return '';
    } else {
      return undefined;
    }
  };

  return (
    <SelectedInput
      data-cy={options.name}
      categoryKey={categoryKey}
      value={defaultValue()}
      selectOptions={selectOptions}
      isVisible={isVisible}
      setValue={setValue}
      otherProps={otherProps}
    />
  );
};
