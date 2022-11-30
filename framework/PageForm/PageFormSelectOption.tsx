import { Controller, useFormContext } from 'react-hook-form'
import { PageSelectOption, PageSelectOptionProps } from '../components/PageSelectOption'

export type PageFormSelectOption<T> = {
  name: string
} & Omit<PageSelectOptionProps<T>, 'onSelect' | 'value'>

/**
 * A PageSelectOption for use in PageForms
 */
export function PageFormSelectOption<T>(props: PageFormSelectOption<T>) {
  const {
    control,
    formState: { isSubmitting },
  } = useFormContext()
  const { name } = props
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <PageSelectOption
          {...props}
          value={value as T}
          onSelect={onChange}
          helperTextInvalid={error?.message}
          readOnly={isSubmitting}
        />
      )}
    />
  )
}
