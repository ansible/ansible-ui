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
  | 'onBlur'
> &
  PageFormGroupProps & {
    children?: ReactNode;
    min?: string;
  };

/** A PatternFly FormGroup with a PatternFly TextInput */
export function FormGroupTextInput(props: FormGroupTextInputProps) {
  const [showSecret, setShowSecret] = useState(false);
  const { children: _children, isReadOnly, placeholder, ...formGroupProps } = props;
  const id = props.id
    ? props.id
    : typeof props.label === 'string'
    ? props.label.toLowerCase().split(' ').join('-')
    : undefined;
  return (
    <PageFormGroup {...formGroupProps} id={id}>
      <InputGroup>
        <TextInput
          autoComplete={props.autoComplete}
          placeholder={placeholder}
          onChange={props.onChange}
          id={id}
          onBlur={props.onBlur}
          label={undefined}
          value={props.value}
          aria-describedby={id ? `${id}-form-group` : undefined}
          validated={props.helperTextInvalid ? 'error' : undefined}
          type={props.type === 'password' ? (showSecret ? 'text' : 'password') : props.type}
          readOnlyVariant={isReadOnly ? 'default' : undefined}
          isDisabled={props.isDisabled}
          min={props.min}
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
