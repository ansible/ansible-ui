import {
  Form,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  TextInput,
} from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';
import { DashboardTableInputFieldProps } from '../types';
import { Help } from '@ansible/ansible-ui-framework';
import { useTranslation } from 'react-i18next';

export function DashboardTableInputField(props: DashboardTableInputFieldProps) {
  const { id, currentValue, min, max, label, labelHelp, fullWidth, type } = props;
  const { t } = useTranslation();
  const [localeValue, setLocaleValue] = useState<string | number | null | undefined>(currentValue);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLocaleValue(currentValue);
    setError(null);
  }, [currentValue]);

  const onChangeHandler = (value: string) => {
    setError(null);
    let numberValue = Number(value);
    if (value === '' || Number.isNaN(numberValue)) {
      setLocaleValue(null);
      return;
    }
    if (max !== undefined && numberValue > Number(max)) {
      numberValue = Number(max);
    }
    if (min !== undefined && numberValue < Number(min)) {
      numberValue = Number(min);
    }
    setLocaleValue(numberValue);
  };

  const onBlurHandler = () => {
    const numberValue = Number(localeValue);
    if (localeValue === null || Number.isNaN(numberValue)) {
      setError(t('Please enter a valid number.'));
      return;
    }
    if (type === 'integer' && !Number.isInteger(numberValue)) {
      setError(t('Please enter a valid integer.'));
      return;
    }
    if (numberValue !== currentValue) {
      props.onBlur(numberValue);
    }
  };

  return (
    <Form onSubmit={(e) => e.preventDefault()}>
      <FormGroup
        fieldId={id}
        label={label}
        labelHelp={labelHelp ? <Help title={label} help={labelHelp} /> : undefined}
        style={{ gridColumn: fullWidth ? 'span 24' : undefined }}
        aria-invalid={error ? 'true' : 'false'}
      >
        <TextInput
          style={{ textAlign: 'right' }}
          id={id}
          name={id}
          onChange={(_event, value: string) => onChangeHandler(value)}
          onBlur={onBlurHandler}
          value={localeValue ?? ''}
          aria-describedby={id ? `${id}-form-group` : undefined}
          type={'number'}
          min={min}
          max={max}
          autoComplete={'off'}
          data-testid={id}
        />
        {error && (
          <FormHelperText>
            <HelperText>
              <HelperTextItem variant={'error'}>{error}</HelperTextItem>
            </HelperText>
          </FormHelperText>
        )}
      </FormGroup>
    </Form>
  );
}
