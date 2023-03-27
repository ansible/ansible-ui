import React, { useState, useEffect, FunctionComponent } from 'react';
import PropTypes from 'prop-types';
import {
  ToolbarFilter,
  TextInput,
  InputGroup,
  Button,
} from '@patternfly/react-core';

import { SearchIcon } from '@patternfly/react-icons';
import { optionsForCategories } from '../../constants';

import { SetValue } from '../../types';

interface Props {
  categoryKey: string;
  isVisible?: boolean;
  value?: string;
  setValue: SetValue;
}

const Text: FunctionComponent<Props> = ({
  categoryKey,
  isVisible = true,
  value = '',
  setValue,
}) => {
  const [searchVal, setSearchVal] = useState(value);
  const options = optionsForCategories[categoryKey];

  const onDelete = () => {
    setValue('');
  };

  const handleChips = () => {
    return value ? [value] : [];
  };

  useEffect(() => {
    setSearchVal(value);
  }, [value]);

  return (
    <ToolbarFilter
      data-cy={categoryKey}
      key={categoryKey}
      showToolbarItem={isVisible}
      chips={options.hasChips ? handleChips() : []}
      categoryName={options.name}
      deleteChip={options.hasChips ? onDelete : undefined}
    >
      <InputGroup>
        <TextInput
          type="search"
          aria-label={options.name}
          value={searchVal}
          onChange={setSearchVal}
          onKeyDown={(e) => {
            if (e.key && e.key === 'Enter') {
              e.preventDefault();
              setValue(searchVal);
            }
          }}
        />
        <Button
          variant="control"
          aria-label={`Search button for ${options.name}`}
          onClick={() => {
            setValue(searchVal);
          }}
        >
          <SearchIcon />
        </Button>
      </InputGroup>
    </ToolbarFilter>
  );
};

Text.propTypes = {
  categoryKey: PropTypes.string.isRequired,
  value: PropTypes.any,
  isVisible: PropTypes.bool,
  setValue: PropTypes.func.isRequired,
};

export default Text;
