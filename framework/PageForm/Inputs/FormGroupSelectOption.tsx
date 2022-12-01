import { SelectGroup, SelectOption, SelectOptionObject } from '@patternfly/react-core'
import { ChangeEvent, useCallback } from 'react'
import { FormGroupSelect, FormGroupSelectProps } from './FormGroupSelect'

export interface IFormGroupSelectOption<T> {
  group?: string
  label: string
  description?: string
  value: T
}

export type FormGroupSelectOptionProps<T> = {
  options: IFormGroupSelectOption<T>[]
  onSelect: (
    value: T | undefined,
    event: React.MouseEvent<Element, MouseEvent> | ChangeEvent<Element>
  ) => void
  value: T | undefined
} & Omit<FormGroupSelectProps, 'onSelect' | 'value' | 'children'>

/**
 * A PatternFly FormGroup with a PatternFly Select but using IFormGroupSelectOptions for the options.
 *
 * This supports easy grouping and options that have values that are objects and not just strings.
 */
export function FormGroupSelectOption<T>(props: FormGroupSelectOptionProps<T>) {
  const { onSelect, value } = props

  const onSelectHandler = useCallback(
    (
      event: React.MouseEvent<Element, MouseEvent> | ChangeEvent<Element>,
      label: string | SelectOptionObject
    ) => {
      onSelect(props.options.find((option) => option.label === label.toString())?.value, event)
    },
    [onSelect, props.options]
  )

  const { options } = props
  options.sort((l, r) => {
    if ((l.group ?? '') < (r.group ?? '')) return -1
    if ((l.group ?? '') > (r.group ?? '')) return 1
    if (l.label < r.label) return -1
    if (l.label > r.label) return 1
    return 0
  })
  const groups = options.reduce<
    Record<
      string,
      {
        group?: string
        label: string
        description?: string
        value: T
      }[]
    >
  >((groups, option) => {
    const group = option.group ?? ''
    let optionsArray = groups[group]
    if (!optionsArray) {
      optionsArray = []
      groups[group] = optionsArray
    }
    optionsArray.push(option)
    return groups
  }, {})
  const isGrouped =
    Object.keys(groups).length > 1 ||
    (Object.keys(groups).length === 1 && Object.keys(groups)[0] !== '')

  const selected = props.options.find((option) => option.value === value)

  return (
    <FormGroupSelect
      {...props}
      value={selected?.label}
      onSelect={onSelectHandler}
      isGrouped={isGrouped}
    >
      {!isGrouped
        ? options.map((option) => (
            <SelectOption
              key={option.label}
              value={option.label}
              label={option.label}
              description={option.description}
            >
              {option.label}
            </SelectOption>
          ))
        : Object.keys(groups).map((group) => (
            <SelectGroup key={group} label={group}>
              {groups[group].map((option) => (
                <SelectOption
                  key={option.label}
                  value={option.label}
                  label={option.label}
                  description={option.description}
                >
                  {option.label}
                </SelectOption>
              ))}
            </SelectGroup>
          ))}
    </FormGroupSelect>
  )
}
