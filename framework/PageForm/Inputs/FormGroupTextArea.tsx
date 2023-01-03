import { Button, InputGroup, TextArea, TextAreaProps } from '@patternfly/react-core';
import { EyeIcon, EyeSlashIcon } from '@patternfly/react-icons';
import { useState } from 'react';
import { PageFormGroup, PageFormGroupProps } from './PageFormGroup';

export type FormGroupTextAreaProps = Pick<
  TextAreaProps,
  | 'placeholder'
  | 'value'
  | 'isDisabled'
  | 'isReadOnly'
  | 'isRequired'
  | 'validated'
  | 'onChange'
  | 'type'
  | 'aria-label'
  | 'minLength'
  | 'maxLength'
> &
  PageFormGroupProps;

/** A PatternFly FormGroup with a PatternFly TextArea */
export function FormGroupTextArea(props: FormGroupTextAreaProps) {
  const [showSecret, setShowSecret] = useState(false);
  const { helperTextInvalid: _helperTextInvalid, ...textAreaProps } = props;
  return (
    <PageFormGroup {...props}>
      <InputGroup>
        <TextArea
          {...textAreaProps}
          id={props.id}
          label={undefined}
          aria-describedby={props.id ? `${props.id}-form-group` : undefined}
          validated={props.helperTextInvalid ? 'error' : undefined}
        />
        {props.type === 'password' && (
          <Button
            variant="control"
            onClick={() => setShowSecret(!showSecret)}
            isDisabled={props.isDisabled || props.isReadOnly}
          >
            {showSecret ? <EyeIcon /> : <EyeSlashIcon />}
          </Button>
        )}
      </InputGroup>
    </PageFormGroup>
  );
}
