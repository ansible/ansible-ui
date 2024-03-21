import {
  Controller,
  FieldPath,
  FieldPathValue,
  FieldValues,
  Validate,
  useFormContext,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageSingleSelect, PageSingleSelectProps } from '../../PageInputs/PageSingleSelect';
import { useID } from '../../hooks/useID';
import { useFrameworkTranslations } from '../../useFrameworkTranslations';
import { capitalizeFirstLetter } from '../../utils/strings';
import { PageFormGroup, PageFormGroupProps } from './PageFormGroup';

export type PageFormSingleSelectProps<
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
  PageSingleSelectProps<ValueT>,
  'id' | 'placeholder' | 'options' | 'footer' | 'isDisabled' | 'isRequired'
> &
  Pick<
    PageFormGroupProps,
    'label' | 'labelHelp' | 'labelHelpTitle' | 'additionalControls' | 'isRequired' | 'helperText'
  >;

export function PageFormSingleSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: PageFormSingleSelectProps<TFieldValues, TFieldName>) {
  const id = useID(props);

  const { control, formState } = useFormContext<TFieldValues>();
  const { isSubmitting, isValidating } = formState;

  const [translations] = useFrameworkTranslations();
  const { t } = useTranslation();

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
          isDisabled = '';
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
          >
            <PageSingleSelect
              id={id}
              data-cy={id ?? name}
              placeholder={props.placeholder}
              options={props.options}
              aria-describedby={id ? `${id}-form-group` : undefined}
              value={value}
              onSelect={onChange}
              isDisabled={isDisabled}
              footer={props.footer}
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
