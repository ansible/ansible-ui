import {
  Form,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  TextInput,
} from '@patternfly/react-core';
import { useEffect, useState } from 'react';
import { DashboardTableInputFieldProps } from '../types';
import { Help } from '@ansible/ansible-ui-framework';
import { useTranslation } from 'react-i18next';
import { useDebounce } from '@ansible/ansible-ui-framework/hooks/useDebounce';

export function DashboardTableInputField(props: DashboardTableInputFieldProps) {
  const {
    id,
    min,
    max,
    label,
    labelHelp,
    fullWidth,
    type,
    readOnly,
    error: errorMsg,
    onChange,
  } = props;
  const { t } = useTranslation();
  const [value, setValue] = useState<string | number | undefined>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValue(props.value);
    setError(null);
  }, [props.value]);

  const setValueDebounced = useDebounce((newValue: number | undefined) => {
    if (newValue !== undefined) {
      onChange(newValue);
    }
  }, 600);

  const onChangeHandler = (newValue: string) => {
    // Cancel any previously scheduled save by replacing it with undefined.
    // If the debounce fires with undefined, onChange is not called (see setValueDebounced above).
    // A new valid save is rescheduled at the bottom if validation passes.
    setValueDebounced(undefined);
    setError(null);
    setValue(newValue);
    const numberValue = Number(newValue);
    if (newValue === '' || Number.isNaN(numberValue)) {
      setError(t('Please enter a valid number.'));
      return;
    }
    if (type === 'integer' && !Number.isInteger(numberValue)) {
      setError(t('Please enter a valid integer.'));
      return;
    }
    if (max !== undefined && numberValue > max) {
      setError(t('Value must be less than or equal to {{max}}.', { max }));
      return;
    }
    if (min !== undefined && numberValue < min) {
      setError(t('Value must be greater than or equal to {{min}}.', { min }));
      return;
    }
    setValueDebounced(numberValue);
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
          value={value ?? ''}
          aria-describedby={id ? `${id}-form-group` : undefined}
          type={'number'}
          min={min}
          max={max}
          autoComplete={'off'}
          data-testid={id}
          isDisabled={readOnly === true}
        />
        {(error || errorMsg) && (
          <FormHelperText>
            <HelperText>
              <HelperTextItem variant={'error'}>{error ?? errorMsg}</HelperTextItem>
            </HelperText>
          </FormHelperText>
        )}
      </FormGroup>
    </Form>
  );
}
