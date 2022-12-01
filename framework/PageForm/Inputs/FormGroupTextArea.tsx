import { Button, InputGroup, TextArea, TextAreaProps } from '@patternfly/react-core'
import { EyeIcon, EyeSlashIcon } from '@patternfly/react-icons'
import { useState } from 'react'
import { PageFormGroup, PageFormGroupProps } from './PageFormGroup'

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
> &
  PageFormGroupProps

/** Thin wrapper combining a PF FormGroup and a PF TextArea */
export function FormGroupTextArea(props: FormGroupTextAreaProps) {
  const [showSecret, setShowSecret] = useState(false)
  return (
    <PageFormGroup {...props}>
      <InputGroup>
        <TextArea
          {...props}
          id={props.id}
          label={undefined}
          aria-describedby={`${props.id}-form-group`}
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
  )
}
