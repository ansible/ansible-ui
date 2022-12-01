import { Flex, FlexItem, FormGroup, Slider } from '@patternfly/react-core'
import { useController, useFormContext } from 'react-hook-form'

export function PageFormSlider(props: {
  id?: string
  label: string
  name: string
  helperText?: string
  required?: boolean
  autoFocus?: boolean
  min?: number
  max?: number
  valueLabel?: string
}) {
  const {
    formState: { isSubmitting },
  } = useFormContext()
  const { field, fieldState } = useController({ name: props.name })
  const error = fieldState.error
  const id = props.id ?? props.name
  const max = props.max ?? 100
  const min = props.min ?? 1
  const value = Number(field.value)
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
      <Flex alignItems={{ default: 'alignItemsFlexStart' }}>
        <Flex
          alignItems={{ default: 'alignItemsFlexStart' }}
          spaceItems={{ default: 'spaceItemsSm' }}
        >
          <FlexItem style={{ paddingTop: 6, minWidth: 20, textAlign: 'right' }}>
            {Math.floor((max - min) * value + min)}
          </FlexItem>
          {props.valueLabel && (
            <FlexItem style={{ paddingTop: 6, minWidth: 40 }}>{props.valueLabel}</FlexItem>
          )}
        </Flex>
        <FlexItem grow={{ default: 'grow' }}>
          <Slider
            id={id}
            aria-describedby={`${id}-form-group`}
            // isRequired={props.required}
            // validated={error?.message ? 'error' : undefined}
            autoFocus={props.autoFocus}
            // {...registration}
            value={(max - min) * value + min}
            onChange={(v) => field.onChange((v - min) / (max - min))}
            max={max}
            min={min}
            // innerRef={registration.ref}
            isDisabled={isSubmitting}
            showBoundaries={false}
          />
        </FlexItem>
      </Flex>
    </FormGroup>
  )
}
