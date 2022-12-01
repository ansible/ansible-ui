import { Select, SelectOptionObject, SelectProps, SelectVariant } from '@patternfly/react-core'
import React, { ChangeEvent, ReactElement, useCallback, useState } from 'react'
import { PageFormGroup, PageFormGroupProps } from './PageFormGroup'

export type FormGroupSelectProps = Pick<
  SelectProps,
  'footer' | 'isCreatable' | 'isGrouped' | 'onSelect' | 'placeholder' | 'value' | 'isDisabled'
> &
  PageFormGroupProps & { isReadOnly?: boolean }

/** Wrapper over a PatternFly Select.
 * Simplifies the PatternFly Select.
 * Supports a PageFormGroup with label if label is specififed.
 */
export function FormGroupSelect(props: FormGroupSelectProps) {
  const { children, helperTextInvalid, isReadOnly, onSelect, value } = props

  const [open, setOpen] = useState(false)
  const onToggle = useCallback(() => setOpen((open) => !open), [])

  const onSelectHandler = useCallback(
    (
      event: React.MouseEvent<Element, MouseEvent> | ChangeEvent<Element>,
      value: string | SelectOptionObject
    ) => {
      if (typeof value === 'string') onSelect?.(event, value)
      else onSelect?.(event, value.toString())
      setOpen(false)
    },
    [onSelect]
  )

  return (
    <PageFormGroup {...props}>
      <Select
        {...props}
        label={undefined}
        variant={SelectVariant.single}
        aria-describedby={props.id ? `${props.id}-form-group` : undefined}
        selections={value}
        onSelect={onSelectHandler}
        isOpen={open}
        onToggle={onToggle}
        maxHeight={280}
        validated={helperTextInvalid ? 'error' : undefined}
        isDisabled={props.isDisabled || isReadOnly}
      >
        {children as ReactElement[]}
      </Select>
    </PageFormGroup>
  )
}
