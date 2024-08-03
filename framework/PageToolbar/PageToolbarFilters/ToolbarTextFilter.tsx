import {
  Button,
  InputGroup,
  InputGroupItem,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
} from '@patternfly/react-core';
import { ArrowRightIcon, TimesIcon } from '@patternfly/react-icons';
import debounce from 'debounce';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ToolbarFilterType } from '../PageToolbarFilter';
import { ToolbarFilterCommon } from './ToolbarFilterCommon';

/** Filter for filtering by user text input with single value. */
export interface IToolbarSingleTextFilter extends ToolbarFilterCommon {
  type: ToolbarFilterType.SingleText;

  /** The placeholder text for the filter, indicating what kind of filter caprison it uses. */
  comparison: 'contains' | 'startsWith' | 'endsWith' | 'equals';
}

/** Filter for filtering by user text input with multiple values. */
export interface IToolbarMultiTextFilter extends ToolbarFilterCommon {
  /** Filter for filtering by user text input. */
  type: ToolbarFilterType.MultiText;

  /** The placeholder text for the filter, indicating what kind of filter caprison it uses. */
  comparison: 'contains' | 'startsWith' | 'endsWith' | 'equals';
}

export function ToolbarTextMultiFilter(props: {
  id?: string;
  addFilter: (value: string) => void;
  placeholder?: string;

  /** The placeholder text for the filter, indicating what kind of filter caprison it uses. */
  comparison: 'contains' | 'startsWith' | 'endsWith' | 'equals';
}) {
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
      <InputGroupItem>
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
      </InputGroupItem>

      <InputGroupItem>
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
      </InputGroupItem>
    </InputGroup>
  );
}

export function ToolbarSingleTextFilter(props: {
  id?: string;
  placeholder?: string;

  /** The placeholder text for the filter, indicating what kind of filter caprison it uses. */
  comparison: 'contains' | 'startsWith' | 'endsWith' | 'equals';
  setValue: (value: string) => void;
  value: string;
  hasKey: boolean;
}) {
  const { t } = useTranslation();
  const [value, setValue] = useState(props.value ?? '');
  let placeholder = props.placeholder ?? '';
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const setValueDebounced = useCallback(
    debounce((value: string) => props.setValue(value), 500),
    []
  );

  useEffect(() => {
    if (!props.hasKey) {
      setValue('');
    }
  }, [props.hasKey]);

  return (
    <InputGroup>
      <InputGroupItem>
        <TextInputGroup data-cy={'text-input'} style={{ minWidth: 220 }}>
          <TextInputGroupMain
            id={props.id}
            value={value}
            onChange={(e, v) => {
              if (typeof e === 'string') {
                setValue(e);
                setValueDebounced(e);
              } else {
                setValue(v);
                setValueDebounced(v);
              }
            }}
            placeholder={placeholder}
          />
          {value !== '' && (
            <TextInputGroupUtilities>
              <Button
                variant="plain"
                aria-label="clear filter"
                onClick={() => {
                  setValue('');
                  props.setValue('');
                }}
                style={{ opacity: value ? undefined : 0 }}
                tabIndex={-1}
              >
                <TimesIcon />
              </Button>
            </TextInputGroupUtilities>
          )}
        </TextInputGroup>
      </InputGroupItem>
    </InputGroup>
  );
}
