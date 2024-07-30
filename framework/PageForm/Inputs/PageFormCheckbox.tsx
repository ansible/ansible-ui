import { Checkbox, CheckboxProps } from '@patternfly/react-core';
import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { ReactNode } from 'react';
import {
  Controller,
  FieldPath,
  FieldValues,
  PathValue,
  Validate,
  useFormContext,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageActionSelection, PageActionType } from '../../PageActions/PageAction';
import { PageActions } from '../../PageActions/PageActions';
import { Help } from '../../components/Help';
import { PFColorE, getPatternflyColor } from '../../components/pfcolors';
import { useRequiredValidationRule } from './validation-hooks';

export type PageFormCheckboxProps<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  id?: string;
  name: TFieldName;
  validate?: Validate<boolean, TFieldValues> | Record<string, Validate<boolean, TFieldValues>>;
  labelHelpTitle?: string;
  labelHelp?: string | string[] | ReactNode;
  label?: string;
  defaultValue?: boolean;
  enableReset?: boolean;
} & Pick<CheckboxProps, 'description' | 'readOnly' | 'isDisabled' | 'isRequired'>;

/** PatternFly Checkbox wrapper for use with react-hook-form */
export function PageFormCheckbox<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: PageFormCheckboxProps<TFieldValues, TFieldName>) {
  const { name, readOnly, validate } = props;
  const {
    control,
    setValue,
    formState: { isSubmitting },
  } = useFormContext<TFieldValues>();

  const { t } = useTranslation();

  const required = useRequiredValidationRule(props.label, props.isRequired);

  return (
    <Controller<TFieldValues, TFieldName>
      name={name}
      control={control}
      defaultValue={props.defaultValue as unknown as PathValue<TFieldValues, TFieldName>}
      shouldUnregister
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const helperTextInvalid = error?.message;
        return (
          <>
            <Checkbox
              name={name}
              id={props.id ?? name.split('.').join('-')}
              data-cy={props.id ?? name.split('.').join('-')}
              aria-label={props.label}
              label={
                <div style={{ display: 'flex' }}>
                  <div>
                    {props.label}
                    {props.labelHelp && (
                      <Help title={props.labelHelpTitle} help={props.labelHelp} />
                    )}
                  </div>
                  <div style={{ marginTop: -6, marginBottom: -6 }}>
                    <PageActions
                      actions={[
                        {
                          label: t('Reset to default'),
                          type: PageActionType.Button,
                          selection: PageActionSelection.None,
                          onClick: () => {
                            setValue(
                              name as FieldPath<TFieldValues>,
                              props.defaultValue as unknown as PathValue<
                                TFieldValues,
                                FieldPath<TFieldValues>
                              >
                            );
                          },
                          isHidden: () => !props.enableReset || value === props.defaultValue,
                        },
                      ]}
                      position={DropdownPosition.right}
                    />
                  </div>
                </div>
              }
              isChecked={!!value}
              onChange={onChange}
              readOnly={readOnly || isSubmitting}
              isDisabled={props.isDisabled}
              isRequired={props.isRequired}
              description={
                helperTextInvalid ? (
                  <span style={{ color: getPatternflyColor(PFColorE.Danger) }}>
                    {helperTextInvalid}
                  </span>
                ) : (
                  props.description
                )
              }
            />
          </>
        );
      }}
      rules={{ required, validate }}
    />
  );
}
