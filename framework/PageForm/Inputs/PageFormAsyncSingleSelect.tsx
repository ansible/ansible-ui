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
import { capitalizeFirstLetter } from '../../utils/strings';
import { PageFormGroup, PageFormGroupProps } from './PageFormGroup';
import { PathValue } from 'react-hook-form';

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
> &
  Pick<
    PageFormGroupProps,
    'label' | 'labelHelp' | 'labelHelpTitle' | 'additionalControls' | 'isRequired' | 'helperText'
  >;

export function PageFormAsyncSingleSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: PageFormAsyncSingleSelectProps<TFieldValues, TFieldName> & {
    getLabel?: (value: PathValue<TFieldValues, TFieldName>) => string;
    renderFooter?: (
      value: PathValue<TFieldValues, TFieldName>,
      onChange: (value: PathValue<TFieldValues, TFieldName>) => void
    ) => React.ReactNode;
  }
) {
  const id = useID(props);

  const { control, formState } = useFormContext<TFieldValues>();
  const { isSubmitting, isValidating } = formState;

  const [translations] = useFrameworkTranslations();

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

        return (
          <PageFormGroup
            fieldId={id}
            label={props.label}
            labelHelpTitle={props.labelHelpTitle}
            labelHelp={props.labelHelp}
            helperText={props.helperText}
            helperTextInvalid={helperTextInvalid}
            isRequired={props.isRequired}
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
              isDisabled={props.isDisabled || props.isReadOnly || isSubmitting}
              footer={props.renderFooter ? props.renderFooter(value, onChange) : props.footer}
              displaySelectedLabel={props.getLabel ? props.getLabel(value) : undefined}
            />
          </PageFormGroup>
        );
      }}
      rules={{
        required:
          typeof props.label === 'string' && props.isRequired === true
            ? {
                value: true,
                message: `${capitalizeFirstLetter(props.label.toLocaleLowerCase())} is required.`,
              }
            : undefined,
        validate: props.validate,
      }}
    />
  );
}
