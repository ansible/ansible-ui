import { Button } from '@patternfly/react-core';
import { EyeIcon, EyeSlashIcon, SearchIcon } from '@patternfly/react-icons';
import {
  FieldPath,
  FieldValues,
  PathValue,
  UseFormSetValue,
  UseFormTrigger,
} from 'react-hook-form';

export type PageFormTextFieldType =
  | 'text'
  | 'date'
  | 'datetime-local'
  | 'email'
  | 'month'
  | 'number'
  | 'password'
  | 'search'
  | 'tel'
  | 'time'
  | 'url';

/**
 * Resolves the HTML input `type`, swapping to `text` while a password field's
 * reveal toggle is active.
 */
export function resolveInputType(
  type: PageFormTextFieldType | undefined,
  showSecret: boolean
): PageFormTextFieldType | undefined {
  if (type !== 'password') return type;
  return showSecret ? 'text' : 'password';
}

/**
 * Resolves the `autoComplete` attribute, defaulting password fields to
 * `new-password` when the consumer hasn't specified one.
 */
export function resolveAutoComplete(autoComplete: string | undefined, type: string | undefined) {
  return autoComplete || (type === 'password' ? 'new-password' : 'off');
}

/**
 * Resolves the helper text shown under the field: the field error, a
 * "validating" placeholder while an async `validate` is running, or nothing.
 */
export function resolveHelperTextInvalid(
  errorMessage: string | undefined,
  hasValidate: boolean,
  isValidating: boolean,
  validatingText: string
): string | undefined {
  if (!errorMessage) return undefined;
  return hasValidate && isValidating ? validatingText : errorMessage;
}

/**
 * Builds the onBlur handler for a field. When the field has an OPTIONS-provided
 * pattern, blur also triggers validation so the pattern's error message appears
 * immediately rather than waiting on the next form-wide validation pass.
 */
export function createPatternBlurHandler<TFieldValues extends FieldValues>(
  hasPattern: boolean,
  onBlur: () => void,
  trigger: UseFormTrigger<TFieldValues>,
  name: FieldPath<TFieldValues>
): () => void {
  if (!hasPattern) return onBlur;
  return () => {
    onBlur();
    void trigger(name);
  };
}

export function PasswordRevealButton(
  props: Readonly<{
    isDisabled?: boolean;
    isReadOnly?: boolean;
    showSecret: boolean;
    onToggle: () => void;
  }>
) {
  return (
    <Button
      variant="control"
      onClick={props.onToggle}
      isDisabled={props.isDisabled || props.isReadOnly}
    >
      {props.showSecret ? <EyeIcon /> : <EyeSlashIcon />}
    </Button>
  );
}

export function SelectLookupButton<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TSelection extends FieldValues = FieldValues,
>(
  props: Readonly<{
    selectTitle: string;
    selectOpen?: (callback: (selection: TSelection) => void, title: string) => void;
    selectValue?: (selection: TSelection) => unknown;
    setValue: UseFormSetValue<TFieldValues>;
    name: TFieldName;
    isDisabled?: boolean;
    isSubmitting: boolean;
  }>
) {
  const { selectTitle, selectOpen, selectValue, setValue, name, isDisabled, isSubmitting } = props;
  return (
    <Button
      icon={<SearchIcon data-cy="lookup-button" data-testid="lookup-button" />}
      ouiaId={`lookup-${name}-button`}
      variant="control"
      onClick={() =>
        selectOpen?.((item: TSelection) => {
          if (selectValue) {
            setValue(name, selectValue(item) as PathValue<TFieldValues, TFieldName>, {
              shouldValidate: true,
            });
          }
        }, selectTitle)
      }
      aria-label="Options menu"
      isDisabled={isDisabled || isSubmitting}
    ></Button>
  );
}
