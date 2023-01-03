import { Button, InputGroup, TextInput, TextInputProps } from '@patternfly/react-core';
import { EyeIcon, EyeSlashIcon } from '@patternfly/react-icons';
import { ReactNode, useState } from 'react';
import { PageFormGroup, PageFormGroupProps } from './PageFormGroup';

export type FormGroupTextInputProps = Pick<
  TextInputProps,
  | 'placeholder'
  | 'value'
  | 'isDisabled'
  | 'isReadOnly'
  | 'isRequired'
  | 'validated'
  | 'onChange'
  | 'type'
  | 'aria-label'
  | 'autoComplete'
  | 'autoFocus'
  | 'innerRef'
  | 'minLength'
  | 'maxLength'
> &
  PageFormGroupProps & { children?: ReactNode };

/** A PatternFly FormGroup with a PatternFly TextInput */
export function FormGroupTextInput(props: FormGroupTextInputProps) {
  const [showSecret, setShowSecret] = useState(false);
  const {
    helperTextInvalid: _helperTextInvalid,
    children: _children,
    isReadOnly,
    ...textInputProps
  } = props;
  const id = props.id
    ? props.id
    : typeof props.label === 'string'
    ? props.label.toLowerCase().split(' ').join('-')
    : undefined;
  return (
    <PageFormGroup {...props} id={id}>
      <InputGroup>
        <TextInput
          {...textInputProps}
          id={id}
          label={undefined}
          aria-describedby={id ? `${id}-form-group` : undefined}
          validated={props.helperTextInvalid ? 'error' : undefined}
          type={props.type === 'password' ? (showSecret ? 'text' : 'password') : props.type}
          readOnlyVariant={isReadOnly ? 'default' : undefined}
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
        {props.children}
      </InputGroup>
    </PageFormGroup>
  );
}
