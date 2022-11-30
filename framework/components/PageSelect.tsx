import { Select, SelectOptionObject, SelectVariant } from '@patternfly/react-core'
import React, { ChangeEvent, ReactElement, ReactNode, useCallback, useState } from 'react'
import { PageFormGroup, PageFormGroupProps } from './PageFormGroup'

export type PageSelectProps = {
  footer?: ReactNode
  isCreatable?: boolean
  isGrouped?: boolean | undefined
  onSelect: (
    value: string,
    event: React.MouseEvent<Element, MouseEvent> | ChangeEvent<Element>
  ) => void
  placeholder?: string
  value: string | undefined
  readOnly?: boolean
} & PageFormGroupProps

/** Wrapper over a PatternFly Select.
 * Simplifies the PatternFly Select.
 * Supports a PageFormGroup with label if label is specififed.
 */
export function PageSelect(props: PageSelectProps) {
  const {
    children,
    footer,
    helperTextInvalid,
    isCreatable,
    isGrouped,
    readOnly: isReadonly,
    label,
    onSelect,
    placeholder,
    value,
  } = props

  const [open, setOpen] = useState(false)
  const onToggle = useCallback(() => setOpen((open) => !open), [])

  const onSelectHandler = useCallback(
    (
      event: React.MouseEvent<Element, MouseEvent> | ChangeEvent<Element>,
      value: string | SelectOptionObject
    ) => {
      if (typeof value === 'string') onSelect(value, event)
      else onSelect(value.toString(), event)
      setOpen(false)
    },
    [onSelect]
  )

  const id = props.id ?? label?.toLocaleLowerCase().split(' ').join('-')

  return (
    <PageFormGroup {...props}>
      <Select
        aria-describedby={id ? `${id}-form-group` : undefined}
        footer={footer}
        id={id}
        isCreatable={isCreatable}
        isGrouped={isGrouped}
        isInputFilterPersisted={isCreatable}
        isOpen={open}
        maxHeight={280}
        onSelect={onSelectHandler}
        onToggle={onToggle}
        placeholderText={placeholder}
        selections={value}
        validated={helperTextInvalid ? 'error' : undefined}
        variant={SelectVariant.single}
        isDisabled={isReadonly}
      >
        {children as ReactElement[]}
      </Select>
    </PageFormGroup>
  )
}
