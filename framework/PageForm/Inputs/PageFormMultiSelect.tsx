import { t } from 'i18next';
import {
  Controller,
  FieldPath,
  FieldPathValue,
  FieldValues,
  Validate,
  useFormContext,
} from 'react-hook-form';
import { PageMultiSelect, PageMultiSelectProps } from '../../PageInputs/PageMultiSelect';
import { useID } from '../../hooks/useID';
import { useFrameworkTranslations } from '../../useFrameworkTranslations';
import { PageFormGroup, PageFormGroupProps } from './PageFormGroup';
import { useRequiredValidationRule } from './validation-hooks';

export type PageFormMultiSelectProps<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  ValueT = FieldPathValue<TFieldValues, TFieldName>,
> = {
  name: TFieldName;
  validate?:
    | Validate<FieldPathValue<TFieldValues, TFieldName>, TFieldValues>
    | Record<string, Validate<FieldPathValue<TFieldValues, TFieldName>, TFieldValues>>;
  isReadOnly?: boolean;
} & Pick<
  PageMultiSelectProps<ValueT>,
  'id' | 'placeholder' | 'options' | 'footer' | 'isDisabled' | 'disableSortOptions'
> &
  Pick<
    PageFormGroupProps,
    'label' | 'labelHelp' | 'labelHelpTitle' | 'additionalControls' | 'isRequired' | 'helperText'
  >;

export function PageFormMultiSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: PageFormMultiSelectProps<TFieldValues, TFieldName>) {
  const id = useID(props);

  const { control, formState } = useFormContext<TFieldValues>();
  const { isSubmitting, isValidating } = formState;

  const [translations] = useFrameworkTranslations();
  const required = useRequiredValidationRule(props.label, props.isRequired);

  return (
    <Controller<TFieldValues, TFieldName>
      name={props.name}
      control={control}
      shouldUnregister
      render={({ field: { value, onChange }, fieldState: { error } }) => {
        const helperTextInvalid = error?.message
          ? props.validate && isValidating
            ? translations.validating
            : error?.message
          : undefined;
        let isDisabled = props.isDisabled;
        if (!isDisabled && props.isReadOnly) {
          isDisabled = t('Readonly');
        }
        if (isSubmitting) {
          isDisabled = t('Submitting');
        }
        return (
          <PageFormGroup
            fieldId={id}
            label={props.label}
            labelHelpTitle={props.labelHelpTitle ?? props.label}
            labelHelp={props.labelHelp}
            helperText={props.helperText}
            helperTextInvalid={helperTextInvalid}
            isRequired={props.isRequired}
            additionalControls={props.additionalControls}
          >
            <PageMultiSelect
              id={id}
              data-cy={id ?? name}
              placeholder={props.placeholder}
              options={props.options}
              aria-describedby={id ? `${id}-form-group` : undefined}
              values={value}
              onSelect={(getNewValues) => onChange(getNewValues(value))}
              isDisabled={isDisabled}
              footer={props.footer}
              disableSortOptions={props.disableSortOptions}
            />
          </PageFormGroup>
        );
      }}
      rules={{ required, validate: props.validate }}
    />
  );
}
