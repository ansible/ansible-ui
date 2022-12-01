import { Controller, useFormContext } from 'react-hook-form'
import { FormGroupSelect, FormGroupSelectProps } from './FormGroupSelect'

export type PageFormSelectProps = { name: string } & Omit<
  FormGroupSelectProps,
  'onSelect' | 'value'
>

/** PatternFly Select wrapper for use with react-hook-form */
export function PageFormSelect(props: PageFormSelectProps) {
  const {
    control,
    formState: { isSubmitting },
  } = useFormContext()
  return (
    <Controller
      name={props.name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <FormGroupSelect
          {...props}
          value={value as string}
          onSelect={(_, value) => onChange(value)}
          helperTextInvalid={error?.message}
          isReadOnly={props.isReadOnly || isSubmitting}
        />
      )}
    />
  )
}
