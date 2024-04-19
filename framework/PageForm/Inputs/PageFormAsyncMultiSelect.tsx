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
  PageAsyncMultiSelect,
  PageAsyncMultiSelectProps,
} from '../../PageInputs/PageAsyncMultiSelect';
import { useID } from '../../hooks/useID';
import { useFrameworkTranslations } from '../../useFrameworkTranslations';
import { PageFormGroup, PageFormGroupProps } from './PageFormGroup';
import { useRequiredValidationRule } from './validation-hooks';

export type PageFormAsyncMultiSelectProps<
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
  PageAsyncMultiSelectProps<ValueT>,
  | 'id'
  | 'placeholder'
  | 'footer'
  | 'isDisabled'
  | 'queryOptions'
  | 'queryPlaceholder'
  | 'queryErrorText'
  | 'disableClearChips'
  | 'disableClearSelection'
  | 'onBrowse'
  | 'queryLabel'
> &
  Pick<
    PageFormGroupProps,
    'label' | 'labelHelp' | 'labelHelpTitle' | 'additionalControls' | 'isRequired' | 'helperText'
  >;

export function PageFormAsyncMultiSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: PageFormAsyncMultiSelectProps<TFieldValues, TFieldName>) {
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
            <PageAsyncMultiSelect
              id={id}
              data-cy={id ?? name}
              placeholder={props.placeholder}
              queryOptions={props.queryOptions}
              queryPlaceholder={props.queryPlaceholder}
              queryErrorText={props.queryErrorText}
              aria-describedby={id ? `${id}-form-group` : undefined}
              values={value}
              onSelect={(getNewValues) => onChange(getNewValues(value))}
              isDisabled={isDisabled}
              footer={props.footer}
              disableClearChips={props.disableClearChips}
              disableClearSelection={props.disableClearSelection}
              onBrowse={props.onBrowse}
              queryLabel={props.queryLabel}
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
