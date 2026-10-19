import { FieldPath, FieldValues, PathValue, UseFormSetValue } from 'react-hook-form';
import type { TextInputType } from './PageFormTextInputTypes';

/** Converts a stored UTC datetime-local value into the local input value. */
export function resolveParsedValue(type: TextInputType | undefined, value: string): string {
  if (type !== 'datetime-local' || !value) return value;
  const utcDate = new Date(value);
  const localDate = new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}

export function handleNumberChange<
  TFieldValues extends FieldValues,
  TFieldName extends FieldPath<TFieldValues>,
>(
  value: string,
  params: {
    name: TFieldName;
    max?: number | string;
    min?: number | string;
    setValue: UseFormSetValue<TFieldValues>;
    onChange: (value: unknown) => void;
  }
) {
  const { name, max, min, setValue, onChange } = params;
  let numberValue = Number(value);
  if (value === '' || Number.isNaN(numberValue)) {
    setValue(name, null as PathValue<TFieldValues, TFieldName>);
    onChange(null);
    return;
  }
  if (max !== undefined && numberValue > Number(max)) {
    numberValue = Number(max);
  }
  if (min !== undefined && numberValue < Number(min)) {
    numberValue = Number(min);
  }
  setValue(name, numberValue as unknown as PathValue<TFieldValues, TFieldName>);
  onChange(numberValue);
}

export function createChangeHandler<
  TFieldValues extends FieldValues,
  TFieldName extends FieldPath<TFieldValues>,
>(params: {
  type?: TextInputType;
  name: TFieldName;
  max?: number | string;
  min?: number | string;
  setValue: UseFormSetValue<TFieldValues>;
  onChange: (value: unknown) => void;
}) {
  return (value: string) => {
    switch (params.type) {
      case 'datetime-local':
        params.onChange(new Date(value).toISOString());
        return;
      case 'number':
        handleNumberChange(value, params);
        return;
      default:
        params.onChange(value.trimStart());
    }
  };
}
