import { FormGroup, FormHelperText, HelperText, HelperTextItem } from '@patternfly/react-core';
import { ReactNode } from 'react';
import styled from 'styled-components';
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
}

/** Wrapper over the PatternFly FormGroup making it optional based on if label is given. */
export function PageFormGroup(props: PageFormGroupProps) {
  const { children, helperText, helperTextInvalid, isRequired, labelHelp, labelHelpTitle, label } =
    props;

  return (
    <FormGroup
      id={`${props.fieldId}-form-group`}
      fieldId={props.fieldId}
      label={
        <>
          <IconSpan>{props.icon}</IconSpan>
          {label}
        </>
      }
      labelIcon={
        labelHelp ? (
          <HelperSpan>
            <Help title={labelHelpTitle} help={labelHelp} />
          </HelperSpan>
        ) : undefined
      }
      labelInfo={props.additionalControls}
      isRequired={isRequired}
      data-cy={`${props.fieldId}-form-group`}
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

const IconSpan = styled.span`
  margin-right: 6px;
`;

const HelperSpan = styled.span`
  margin-left: 4px;
`;
