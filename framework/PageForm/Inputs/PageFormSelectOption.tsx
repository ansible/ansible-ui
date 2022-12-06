import { Controller, useFormContext } from 'react-hook-form'
import { FormGroupSelectOption, FormGroupSelectOptionProps } from './FormGroupSelectOption'

export type PageFormSelectOptionProps<T> = {
  name: string
} & Omit<FormGroupSelectOptionProps<T>, 'onSelect' | 'value'>

/**  Select wrapper for use with react-hook-form */
export function PageFormSelectOption<T>(props: PageFormSelectOptionProps<T>) {
  const {
    control,
    formState: { isSubmitting },
  } = useFormContext()
  return (
    <Controller
      name={props.name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <FormGroupSelectOption
          {...props}
          id={props.id ?? props.name}
          value={value as T}
          onSelect={(_, value) => onChange(value)}
          helperTextInvalid={error?.message}
          isReadOnly={props.isReadOnly || isSubmitting}
        />
      )}
    />
  )
}
