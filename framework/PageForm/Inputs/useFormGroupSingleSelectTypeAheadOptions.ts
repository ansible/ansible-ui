import { SelectOptionProps } from '@patternfly/react-core';
import { useEffect, useMemo, useState } from 'react';

type TypeAheadOption = SelectOptionProps & { group?: string };

export function useFormGroupSingleSelectTypeAheadOptions(
  baseOptions: TypeAheadOption[],
  inputValue: string,
  allowCreate: boolean,
  t: (key: string, options?: { searchTerm: string }) => string
) {
  const [selectOptions, setSelectOptions] = useState<TypeAheadOption[]>(baseOptions);

  useEffect(() => {
    let filteredOptions = baseOptions;
    if (inputValue) {
      filteredOptions = baseOptions.filter((option) =>
        String(option.children).toLowerCase().includes(inputValue.toLowerCase())
      );
      const exactMatch = baseOptions.some(
        (option) => (option.children as string).toLowerCase() === inputValue.toLowerCase()
      );
      if (!exactMatch && filteredOptions.length === 0) {
        filteredOptions = [
          {
            children: allowCreate
              ? `${t('Create new option')} "${inputValue}"`
              : t('No results found for "{{searchTerm}}"', { searchTerm: inputValue }),
            value: allowCreate ? 'CREATE_NEW_VALUE' : 'NO_RESULTS',
            ...(allowCreate ? {} : { isDisabled: true }),
          },
        ];
      } else if (!exactMatch && allowCreate) {
        filteredOptions = [
          ...filteredOptions,
          { children: `${t('Create new option')} "${inputValue}"`, value: 'CREATE_NEW_VALUE' },
        ];
      }
    }
    setSelectOptions(filteredOptions);
  }, [allowCreate, baseOptions, inputValue, t]);

  const groups = useMemo(() => {
    if (!selectOptions.some((option) => !!option.group)) return undefined;
    return selectOptions.reduce<Record<string, TypeAheadOption[]>>((result, option) => {
      const group = option.group ?? '';
      result[group] ??= [];
      result[group].push(option);
      return result;
    }, {});
  }, [selectOptions]);

  return { groups, selectOptions };
}
