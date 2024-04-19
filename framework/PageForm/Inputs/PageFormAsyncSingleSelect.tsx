import { t } from 'i18next';
import {
  Controller,
  FieldPath,
  FieldPathValue,
  FieldValues,
  Validate,
  useFormContext,
} from 'react-hook-form';
import {
  PageAsyncSingleSelect,
  PageAsyncSingleSelectProps,
} from '../../PageInputs/PageAsyncSingleSelect';
import { useID } from '../../hooks/useID';
import { useFrameworkTranslations } from '../../useFrameworkTranslations';
import { PageFormGroup, PageFormGroupProps } from './PageFormGroup';
import { useRequiredValidationRule } from './validation-hooks';

export type PageFormAsyncSingleSelectProps<
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
  PageAsyncSingleSelectProps<ValueT>,
  | 'id'
  | 'placeholder'
  | 'footer'
  | 'isDisabled'
  | 'isRequired'
  | 'queryOptions'
  | 'queryPlaceholder'
  | 'queryErrorText'
  | 'onBrowse'
  | 'queryLabel'
> &
  Pick<
    PageFormGroupProps,
    'label' | 'labelHelp' | 'labelHelpTitle' | 'additionalControls' | 'isRequired' | 'helperText'
  >;

export function PageFormAsyncSingleSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: PageFormAsyncSingleSelectProps<TFieldValues, TFieldName>) {
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
            <PageAsyncSingleSelect
              id={id}
              data-cy={id ?? name}
              placeholder={props.placeholder}
              queryOptions={props.queryOptions}
              queryPlaceholder={props.queryPlaceholder}
              queryErrorText={props.queryErrorText}
              aria-describedby={id ? `${id}-form-group` : undefined}
              value={value}
              onSelect={onChange}
              isDisabled={isDisabled}
              footer={props.footer}
              onBrowse={props.onBrowse}
              queryLabel={props.queryLabel}
              disableAutoSelect
              isRequired={props.isRequired}
            />
          </PageFormGroup>
        );
      }}
      rules={{
        required,
        validate: props.validate,
      }}
    />
  );
}
