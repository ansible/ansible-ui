import { FormGroup, FormHelperText, HelperText, HelperTextItem } from '@patternfly/react-core';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Help } from '../../components/Help';

export type PageFormHelperTextVariant =
  | 'default'
  | 'indeterminate'
  | 'warning'
  | 'success'
  | 'error';

export interface PageFormGroupProps {
  fieldId?: string;

  icon?: ReactNode;
  label?: string;
  labelHelp?: string | string[] | ReactNode;
  labelHelpTitle?: string;
  isRequired?: boolean;

  additionalControls?: ReactNode;

  children?: ReactNode;

  helperText?: ReactNode;
  helperTextVariant?: PageFormHelperTextVariant;
  helperTextInvalid?: string | string[] | false;

  fullWidth?: boolean;
}

/** Wrapper over the PatternFly FormGroup making it optional based on if label is given. */
export function PageFormGroup(props: PageFormGroupProps) {
  const { t } = useTranslation();
  const {
    children,
    helperText,
    helperTextVariant,
    helperTextInvalid,
    isRequired,
    labelHelp,
    labelHelpTitle,
    label,
    fullWidth,
  } = props;

  const helperVariant = helperTextInvalid ? 'error' : helperTextVariant;
  const screenReaderText =
    helperVariant && helperVariant !== 'default'
      ? helperVariant === 'warning'
        ? t('Warning')
        : helperVariant === 'error'
          ? t('Error')
          : helperVariant === 'success'
            ? t('Success')
            : t('Info')
      : undefined;

  return (
    <FormGroup
      id={`${props.fieldId}-form-group`}
      fieldId={props.fieldId}
      label={
        <>
          {props.icon}
          {label}
        </>
      }
      labelHelp={labelHelp ? <Help title={labelHelpTitle} help={labelHelp} /> : undefined}
      labelInfo={props.additionalControls}
      isRequired={isRequired}
      data-cy={`${props.fieldId}-form-group`}
      data-testid={`${props.fieldId}-form-group`}
      style={{ gridColumn: fullWidth ? 'span 12' : undefined }}
    >
      {children}
      {(helperText || helperTextInvalid) && (
        <FormHelperText>
          <HelperText>
            <HelperTextItem variant={helperVariant} screenReaderText={screenReaderText}>
              {helperTextInvalid ? helperTextInvalid : helperText}
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      )}
    </FormGroup>
  );
}
