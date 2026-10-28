import {
  Form,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  TextInput,
} from '@patternfly/react-core';
import { useEffect, useRef, useState } from 'react';
import { DashboardTableInputFieldProps } from '../types';
import { Help } from '@ansible/ansible-ui-framework';
import { useTranslation } from 'react-i18next';
import { useDebounce } from '@ansible/ansible-ui-framework/hooks/useDebounce';
import { getNumberInputError } from '../utils/numberInputValidation';

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

  // Valid value typed by the user but not yet handed to onChange (debounce pending).
  const pendingValueRef = useRef<number | undefined>(undefined);
  // True from the first keystroke until a valid value is handed to onChange, so an
  // intermediate invalid entry (e.g. an emptied field) is protected as well.
  const isEditingRef = useRef(false);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    // Do not overwrite what the user is still typing with an earlier saved value.
    if (isEditingRef.current) {
      return;
    }
    setValue(props.value);
    setError(null);
  }, [props.value]);

  // Send a pending value on unmount instead of silently dropping it.
  useEffect(
    () => () => {
      const pendingValue = pendingValueRef.current;
      if (pendingValue !== undefined) {
        pendingValueRef.current = undefined;
        onChangeRef.current(pendingValue);
      }
    },
    []
  );

  const setValueDebounced = useDebounce((newValue: number | undefined) => {
    pendingValueRef.current = undefined;
    if (newValue !== undefined) {
      isEditingRef.current = false;
      onChange(newValue);
    }
  }, 600);

  const onChangeHandler = (newValue: string) => {
    // Cancel any previously scheduled save by replacing it with undefined.
    // If the debounce fires with undefined, onChange is not called (see setValueDebounced above).
    // A new valid save is rescheduled at the bottom if validation passes.
    setValueDebounced(undefined);
    pendingValueRef.current = undefined;
    isEditingRef.current = true;
    setError(null);
    setValue(newValue);
    const validationError = getNumberInputError(
      newValue,
      { min, max, isInteger: type === 'integer' },
      t
    );
    if (validationError) {
      setError(validationError);
      return;
    }
    const numberValue = Number(newValue);
    pendingValueRef.current = numberValue;
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
