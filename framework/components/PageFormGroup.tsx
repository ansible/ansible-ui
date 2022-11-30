import { FormGroup } from '@patternfly/react-core'
import { ReactNode } from 'react'

export type PageFormGroupProps = {
  children: ReactNode
  helperText?: ReactNode | undefined
  helperTextInvalid?: ReactNode | undefined
  id?: string
  isRequired?: boolean
  label?: string
}

/** Wrapper over the PatternFly FormGroup making it optional based on if label is given. */
export function PageFormGroup(props: PageFormGroupProps) {
  const { children, helperText, helperTextInvalid, isRequired, label } = props

  if (!label) {
    return <>{props.children}</>
  }

  const id = props.id ?? label?.toLocaleLowerCase().split(' ').join('-')
  return (
    <FormGroup
      fieldId={id}
      helperText={helperText}
      helperTextInvalid={helperTextInvalid}
      id={`${id}-form-group`}
      isRequired={isRequired}
      label={label}
      validated={helperTextInvalid ? 'error' : undefined}
    >
      {children}
    </FormGroup>
  )
}
