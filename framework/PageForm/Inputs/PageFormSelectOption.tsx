import { Controller, useFormContext } from 'react-hook-form'
import { PageSelectOption, PageSelectOptionProps } from './PageSelectOption'

export type PageFormSelectOptionProps<T> = {
  name: string
} & Omit<PageSelectOptionProps<T>, 'onSelect' | 'value'>

/**
 * A PageSelectOption for use in PageForms
 */
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
        <PageSelectOption
          {...props}
          value={value as T}
          onSelect={(_, value) => onChange(value)}
          helperTextInvalid={error?.message}
          isReadOnly={props.isReadOnly || isSubmitting}
        />
      )}
    />
  )
}
