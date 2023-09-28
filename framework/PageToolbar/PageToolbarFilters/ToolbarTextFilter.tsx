import {
  Button,
  InputGroup,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
} from '@patternfly/react-core';
import { ArrowRightIcon, TimesIcon } from '@patternfly/react-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ToolbarFilterType } from '../PageToolbarFilter';
import { ToolbarFilterCommon } from './ToolbarFilterCommon';

/** Filter for filtering by user text input. */
export interface IToolbarTextFilter extends ToolbarFilterCommon {
  /** Filter for filtering by user text input. */
  type: ToolbarFilterType.Text;

  /** The comparison to use when filtering. */
  comparison: 'contains' | 'startsWith' | 'endsWith' | 'equals';
}

export interface IToolbarTextFilterProps {
  id?: string;
  addFilter: (value: string) => void;
  placeholder?: string;
  comparison: 'contains' | 'startsWith' | 'endsWith' | 'equals';
}

export function ToolbarTextFilter(props: IToolbarTextFilterProps) {
  const { t } = useTranslation();
  const [value, setValue] = useState('');
  let placeholder = props.placeholder;
  if (!placeholder) {
    switch (props.comparison) {
      case 'contains':
        placeholder = t('contains');
        break;
      case 'startsWith':
        placeholder = t('starts with');
        break;
      case 'endsWith':
        placeholder = t('ends with');
        break;
      case 'equals':
        placeholder = t('equals');
        break;
    }
  }

  return (
    <InputGroup>
      <TextInputGroup data-cy={'text-input'} style={{ minWidth: 220 }}>
        <TextInputGroupMain
          id={props.id}
          value={value}
          onChange={(e, v) => {
            if (typeof e === 'string') setValue(e);
            else setValue(v);
          }}
          onKeyUp={(event) => {
            if (value && event.key === 'Enter') {
              props.addFilter(value);
              setValue('');
            }
          }}
          placeholder={placeholder}
        />
        {value !== '' && (
          <TextInputGroupUtilities>
            <Button
              variant="plain"
              aria-label="clear filter"
              onClick={() => setValue('')}
              style={{ opacity: value ? undefined : 0 }}
              tabIndex={-1}
            >
              <TimesIcon />
            </Button>
          </TextInputGroupUtilities>
        )}
      </TextInputGroup>

      <Button
        variant={value ? 'primary' : 'control'}
        data-cy="apply-filter"
        aria-label="apply filter"
        onClick={() => {
          props.addFilter(value);
          setValue('');
        }}
        tabIndex={-1}
        isDisabled={!value}
      >
        <ArrowRightIcon />
      </Button>
    </InputGroup>
  );
}
