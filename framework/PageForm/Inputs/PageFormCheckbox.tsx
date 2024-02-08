import { Checkbox, CheckboxProps, Flex } from '@patternfly/react-core';
import { ReactNode } from 'react';
import { Controller, FieldPath, FieldValues, useFormContext, Validate } from 'react-hook-form';
import { Help } from '../../components/Help';

export type PageFormCheckboxProps<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  id?: string;
  name: TFieldName;
  validate?: Validate<boolean, TFieldValues> | Record<string, Validate<boolean, TFieldValues>>;
  labelHelpTitle?: string;
  labelHelp?: string | string[] | ReactNode;
} & Omit<CheckboxProps, 'id' | 'onChange' | 'value'>;

/** PatternFly Checkbox wrapper for use with react-hook-form */
export function PageFormCheckbox<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: PageFormCheckboxProps<TFieldValues, TFieldName>) {
  const { name, readOnly, validate, ...rest } = props;
  const {
    control,
    formState: { isSubmitting },
  } = useFormContext<TFieldValues>();

  return (
    <Controller<TFieldValues, TFieldName>
      name={name}
      control={control}
      shouldUnregister
      render={({ field: { onChange, value } }) => {
        return (
          <Flex
            alignItems={{ default: 'alignItemsBaseline' }}
            spaceItems={{ default: 'spaceItemsXs' }}
          >
            <Checkbox
              {...rest}
              id={props.id ?? name.split('.').join('-')}
              data-cy={props.id ?? name.split('.').join('-')}
              isChecked={!!value}
              onChange={onChange}
              readOnly={readOnly || isSubmitting}
              minLength={undefined}
              maxLength={undefined}
              ref={undefined}
            />
            {props.labelHelp && <Help title={props.labelHelpTitle} help={props.labelHelp} />}
          </Flex>
        );
      }}
      rules={{ validate }}
    />
  );
}
