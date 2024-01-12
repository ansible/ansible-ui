import {
  Button,
  InputGroup,
  InputGroupItem,
  TextInput,
  ToolbarFilter,
} from '@patternfly/react-core';
import PropTypes from 'prop-types';
import { FunctionComponent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SearchIcon } from '@patternfly/react-icons';
import { optionsForCategories } from '../../constants';

import { SetValue } from '../../types';

interface Props {
  categoryKey: string;
  isVisible?: boolean;
  value?: string;
  setValue: SetValue;
}

export const Text: FunctionComponent<Props> = ({
  categoryKey,
  isVisible = true,
  value = '',
  setValue,
}) => {
  const [searchVal, setSearchVal] = useState(value);
  const options = optionsForCategories[categoryKey];

  const { t } = useTranslation();

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
        <InputGroupItem isFill>
          <TextInput
            type="search"
            aria-label={options.name}
            value={searchVal}
            onChange={(_event, val) => setSearchVal(val)}
            onKeyDown={(e) => {
              if (e.key && e.key === 'Enter') {
                e.preventDefault();
                setValue(searchVal);
              }
            }}
          />
        </InputGroupItem>
        <InputGroupItem>
          <Button
            variant="control"
            aria-label={t(`Search button for ${options.name}`)}
            onClick={() => {
              setValue(searchVal);
            }}
          >
            <SearchIcon />
          </Button>
        </InputGroupItem>
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
