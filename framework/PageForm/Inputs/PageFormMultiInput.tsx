import {
  Label,
  LabelGroup,
  Button,
  LabelGroupProps,
  InputGroup,
  TextInput,
} from '@patternfly/react-core';

import { SearchIcon } from '@patternfly/react-icons';
import { useCallback } from 'react';
import {
  Controller,
  FieldPathByValue,
  FieldValues,
  PathValue,
  Validate,
  ValidationRule,
  useFormContext,
} from 'react-hook-form';
import styled from 'styled-components';
import { useID } from '../../hooks/useID';
import { useFrameworkTranslations } from '../../useFrameworkTranslations';
import { capitalizeFirstLetter } from '../../utils/strings';
import { PageFormGroup, PageFormGroupProps } from './PageFormGroup';
import { useRequiredValidationRule } from './validation-hooks';

interface ChipHolderProps {
  readonly $isDisabled: boolean;
}
const ChipHolder = styled.div<ChipHolderProps>`
  --pf-v6-c-form-control--Height: auto;
  align-items: center;
  padding-inline-start: 4px;
  background-color: ${(props) =>
    props.$isDisabled ? 'var(--pf-v6-c-form-control--m-disabled--BackgroundColor)' : null};
`;

export type PageFormMultiInputProps<
  T,
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPathByValue<TFieldValues, T[]> = FieldPathByValue<TFieldValues, T[]>,
> = {
  name: TFieldName;
  placeholder?: string;
  minLength?: number | ValidationRule<number>;
  maxLength?: number | ValidationRule<number>;
  pattern?: ValidationRule<RegExp>;
  validate?: Validate<T[], TFieldValues>;
  selectTitle?: string;
  isDisabled?: boolean;
  selectOpen?: (callback: (selection: T[]) => void, title: string) => void;
  getChipLabel: (item: T) => string;
} & Omit<PageFormGroupProps, 'onChange' | 'value'> &
  LabelGroupProps;

export function PageFormMultiInput<
  T extends { id?: number | string },
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPathByValue<TFieldValues, T[]> = FieldPathByValue<TFieldValues, T[]>,
>(props: PageFormMultiInputProps<T, TFieldValues, TFieldName>) {
  const { validate, selectTitle, selectOpen, placeholder, ...formGroupInputProps } = props;
  const { label, name, minLength, maxLength, pattern, isDisabled } = props;
  const {
    control,
    setValue,
    formState: { isSubmitting, isValidating },
  } = useFormContext<TFieldValues>();
  const [translations] = useFrameworkTranslations();

  const id = useID(props);

  const selectOpenCb = useCallback(
    (items: T[]) => {
      setValue(name, items as unknown as PathValue<TFieldValues, TFieldName>, {
        shouldValidate: true,
      });
    },
    [setValue, name]
  );

  const required = useRequiredValidationRule(props.label, props.isRequired);

  return (
    <Controller<TFieldValues, TFieldName>
      name={name}
      control={control}
      shouldUnregister
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const removeItem = (item: T) => {
          onChange((value as T[]).filter((i: T) => i.id !== item.id));
        };

        return (
          <PageFormGroup
            {...formGroupInputProps}
            fieldId={id}
            helperTextInvalid={!(validate && isValidating) && error?.message}
          >
            <InputGroup>
              {value?.length ? (
                <ChipHolder
                  $isDisabled={isSubmitting || (isDisabled ?? false)}
                  className="pf-v6-c-form-control"
                >
                  <LabelGroup
                    numLabels={5}
                    expandedText={translations.showLess}
                    collapsedText={translations.countMore.replace(
                      '{count}',
                      `${value?.length - 5}`
                    )}
                  >
                    {(value as T[])?.map((item: T) => (
                      <Label variant="outline" key={item.id} onClose={() => removeItem(item)}>
                        {props.getChipLabel(item)}
                      </Label>
                    ))}
                  </LabelGroup>
                </ChipHolder>
              ) : (
                <TextInput aria-label={placeholder} isDisabled placeholder={placeholder} />
              )}
              {selectTitle && (
                <Button
                  icon={<SearchIcon />}
                  variant="control"
                  onClick={() => selectOpen?.(selectOpenCb, props.selectTitle as string)}
                  aria-label="Options menu"
                  isDisabled={isSubmitting || isDisabled}
                ></Button>
              )}
            </InputGroup>
          </PageFormGroup>
        );
      }}
      rules={{
        required,

        minLength:
          typeof label === 'string' && typeof minLength === 'number'
            ? {
                value: minLength,
                message: `${capitalizeFirstLetter(
                  label.toLocaleLowerCase()
                )} must be at least ${minLength} characters.`,
              }
            : minLength,

        maxLength:
          typeof label === 'string' && typeof maxLength === 'number'
            ? {
                value: maxLength,
                message: `${capitalizeFirstLetter(
                  label.toLocaleLowerCase()
                )} cannot be greater than ${maxLength} characters.`,
              }
            : maxLength,

        pattern: pattern,
        validate,
      }}
    />
  );
}
