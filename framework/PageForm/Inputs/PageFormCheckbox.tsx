import { Checkbox } from '@patternfly/react-core'
import { ReactNode } from 'react'
import { useController, useFormContext } from 'react-hook-form'

export function PageFormCheckbox(props: {
  label: string
  name: string
  helperText?: string
  required?: boolean
  description?: ReactNode
  body?: ReactNode
}) {
  const { control } = useFormContext()
  const { field } = useController({ control, name: props.name })
  const id = props.name
  return (
    <Checkbox
      label={props.label}
      id={id}
      aria-describedby={`${id}-helper`}
      description={props.description}
      body={field.value ? props.body : undefined}
      {...field}
      isChecked={!!field.value}
    />
  )
}
