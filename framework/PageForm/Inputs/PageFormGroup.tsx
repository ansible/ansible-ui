import { FormGroup, FormGroupProps } from '@patternfly/react-core';
import { ReactNode } from 'react';
import { Help } from '../../components/Help';

export type PageFormGroupProps = Pick<
  FormGroupProps,
  'children' | 'helperText' | 'helperTextInvalid' | 'isRequired' | 'label' | 'labelIcon'
> & {
  id?: string;
  labelHelpTitle?: string;
  labelHelp?: string;
  additionalControls?: ReactNode;
};

/** Wrapper over the PatternFly FormGroup making it optional based on if label is given. */
export function PageFormGroup(props: PageFormGroupProps) {
  const { children, helperText, helperTextInvalid, isRequired, labelHelp, labelHelpTitle, label } =
    props;

  return (
    <FormGroup
      id={`${props.id ?? ''}-form-group`}
      fieldId={props.id}
      label={label}
      helperText={helperText}
      helperTextInvalid={helperTextInvalid}
      validated={helperTextInvalid ? 'error' : undefined}
      isRequired={isRequired}
      labelInfo={props.additionalControls}
      labelIcon={labelHelp ? <Help title={labelHelpTitle} help={labelHelp} /> : undefined}
    >
      {children}
    </FormGroup>
  );
}
