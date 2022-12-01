import { Button, InputGroup, TextInput, TextInputProps } from '@patternfly/react-core'
import { EyeIcon, EyeSlashIcon } from '@patternfly/react-icons'
import { useState } from 'react'
import { PageFormGroup, PageFormGroupProps } from './PageFormGroup'

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
> &
  PageFormGroupProps

/** A PatternFly FormGroup with a PatternFly TextInput */
export function FormGroupTextInput(props: FormGroupTextInputProps) {
  const [showSecret, setShowSecret] = useState(false)
  return (
    <PageFormGroup {...props}>
      <InputGroup>
        <TextInput
          {...props}
          id={props.id}
          label={undefined}
          aria-describedby={`${props.id}-form-group`}
          validated={props.helperTextInvalid ? 'error' : undefined}
          type={props.type === 'password' ? (showSecret ? 'text' : 'password') : props.type}
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
  )
}
