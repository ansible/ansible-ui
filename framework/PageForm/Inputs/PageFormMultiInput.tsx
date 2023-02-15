import { Button, ChipGroup, Chip, InputGroup } from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import {
  Controller,
  FieldPath,
  FieldValues,
  PathValue,
  useFormContext,
  Validate,
  ValidationRule,
} from 'react-hook-form';
import styled from 'styled-components';
import { capitalizeFirstLetter } from '../../utils/capitalize';
import { PageFormGroup, PageFormGroupProps } from './PageFormGroup';

const ChipHolder = styled.div`
  --pf-c-form-control--Height: auto;
  background-color: ${(props: { isDisabled?: boolean }) =>
    props.isDisabled ? 'var(--pf-global--disabled-color--300)' : null};
`;

export type PageFormMultiInputProps<
  T,
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TFieldName;
  minLength?: number | ValidationRule<number>;
  maxLength?: number | ValidationRule<number>;
  pattern?: ValidationRule<RegExp>;
  validate?: Validate<T[], TFieldValues>;
  selectTitle?: string;
  selectOpen?: (callback: (selection: T[]) => void, title: string) => void;
} & Omit<PageFormGroupProps, 'onChange' | 'value'>;

interface FieldValuesWithArray<T> extends FieldValues {
  [key: string]: T[];
}

export function PageFormMultiInput<
  T extends { id: number; name: string },
  TFieldValues extends FieldValuesWithArray<T> = FieldValuesWithArray<T>,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(props: PageFormMultiInputProps<T, TFieldValues, TFieldName>) {
  const { validate, selectTitle, selectOpen, ...formGroupInputProps } = props;
  const { label, name, isRequired, minLength, maxLength, pattern } = props;
  const {
    control,
    setValue,
    formState: { isSubmitting, isValidating },
  } = useFormContext<TFieldValues>();
  const { t } = useTranslation();

  return (
    <Controller<TFieldValues, TFieldName>
      name={name}
      control={control}
      shouldUnregister
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const removeItem = (item: T) => {
          onChange(value.filter((i) => i.id !== item.id));
        };

        return (
          <PageFormGroup
            {...formGroupInputProps}
            id={props.id ?? name.split('.').join('-')}
            helperTextInvalid={!(validate && isValidating) && error?.message}
          >
            <InputGroup>
              <ChipHolder isDisabled={isSubmitting} className="pf-c-form-control">
                <ChipGroup
                  numChips={5}
                  expandedText={t('Show less')}
                  collapsedText={t(`${value?.length - 5} more`)}
                >
                  {value?.map((item) => (
                    <Chip key={item.id} onClick={() => removeItem(item)}>
                      {/* TODO: add renderChip() callback prop? */}
                      {item.name}
                    </Chip>
                  ))}
                </ChipGroup>
              </ChipHolder>
              {selectTitle && (
                <Button
                  variant="control"
                  onClick={() =>
                    selectOpen?.((items: T[]) => {
                      setValue(name, items as unknown as PathValue<TFieldValues, TFieldName>, {
                        shouldValidate: true,
                      });
                    }, props.selectTitle as string)
                  }
                  aria-label="Options menu"
                  isDisabled={isSubmitting}
                >
                  <SearchIcon />
                </Button>
              )}
            </InputGroup>
          </PageFormGroup>
        );
      }}
      rules={{
        required:
          typeof label === 'string' && typeof isRequired === 'boolean'
            ? {
                value: true,
                message: `${capitalizeFirstLetter(label.toLocaleLowerCase())} is required.`,
              }
            : isRequired,

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
        validate: validate,
      }}
    />
  );
}
