import { FormGroup, TextArea } from '@patternfly/react-core'
import { useController, useFormContext } from 'react-hook-form'

export function PageFormTextArea(props: {
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
      <TextArea
        id={id}
        type={props.secret ? 'password' : 'text'}
        aria-describedby={`${id}-form-group`}
        isRequired={props.required}
        validated={error?.message ? 'error' : undefined}
        autoFocus={props.autoFocus}
        placeholder={props.placeholder}
        {...registration}
        onChange={(v, e) => void registration.onChange(e)}
        resizeOrientation="vertical"
        isReadOnly={isSubmitting}
        // innerRef={registration.ref}
      />
    </FormGroup>
  )
}
