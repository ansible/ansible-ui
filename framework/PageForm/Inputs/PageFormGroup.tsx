import { FormGroup, FormHelperText, HelperText, HelperTextItem } from '@patternfly/react-core';
import { ReactNode } from 'react';
import { Help } from '../../components/Help';

export interface PageFormGroupProps {
  fieldId?: string;

  icon?: ReactNode;
  label?: string;
  labelHelp?: string | string[] | ReactNode;
  labelHelpTitle?: string;
  isRequired?: boolean;

  additionalControls?: ReactNode;

  children?: ReactNode;

  helperText?: string;
  helperTextInvalid?: string | string[] | false;

  fullWidth?: boolean;
}

/** Wrapper over the PatternFly FormGroup making it optional based on if label is given. */
export function PageFormGroup(props: PageFormGroupProps) {
  const {
    children,
    helperText,
    helperTextInvalid,
    isRequired,
    labelHelp,
    labelHelpTitle,
    label,
    fullWidth,
  } = props;

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
            <HelperTextItem variant={helperTextInvalid ? 'error' : undefined}>
              {helperTextInvalid ? helperTextInvalid : helperText}
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      )}
    </FormGroup>
  );
}
