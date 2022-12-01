import { Button, FormGroup, InputGroup, TextInput } from '@patternfly/react-core'
import { EyeIcon, EyeSlashIcon } from '@patternfly/react-icons'
import { useState } from 'react'
import { useController, useFormContext } from 'react-hook-form'

export function PageFormTextInput(props: {
  id?: string
  label: string
  name: string
  helperText?: string
  required?: boolean
  secret?: boolean
  autoFocus?: boolean
  placeholder?: string
}) {
  const {
    register,
    formState: { isSubmitting },
  } = useFormContext()
  const registration = register(props.name)
  const { fieldState } = useController({ name: props.name })
  const error = fieldState.error
  const id = props.id ?? props.name
  const [showSecret, setShowSecret] = useState(false)
  return (
    <FormGroup
      id={`${id}-form-group`}
      fieldId={id}
      label={props.label}
      helperText={props.helperText}
      isRequired={props.required}
      validated={error?.message ? 'error' : undefined}
      helperTextInvalid={error?.message}
    >
      <InputGroup>
        <TextInput
          id={id}
          type={props.secret && !showSecret ? 'password' : 'text'}
          aria-describedby={`${id}-form-group`}
          isRequired={props.required}
          validated={error?.message ? 'error' : undefined}
          autoFocus={props.autoFocus}
          placeholder={props.placeholder}
          {...registration}
          onChange={(v, e) => {
            void registration.onChange(e)
          }}
          isReadOnly={isSubmitting}
        />
        {props.secret && (
          <Button
            variant="control"
            onClick={() => setShowSecret(!showSecret)}
            aria-label="Options menu"
            isDisabled={isSubmitting}
          >
            {showSecret ? <EyeIcon /> : <EyeSlashIcon />}
          </Button>
        )}
      </InputGroup>
    </FormGroup>
  )
}
