import { Controller, useFormContext } from 'react-hook-form'
import { FormGroupTextInput, FormGroupTextInputProps } from './FormGroupTextInput'

export type PageFormTextInputProps = { name: string } & Omit<
  FormGroupTextInputProps,
  'onChange' | 'value'
>

/** PatternFly TextInput wrapper for use with react-hook-form */
export function PageFormTextInput(props: PageFormTextInputProps) {
  const {
    control,
    formState: { isSubmitting },
  } = useFormContext()
  return (
    <Controller
      name={props.name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <>
          <FormGroupTextInput
            {...props}
            value={value as string}
            onChange={onChange}
            helperTextInvalid={
              error?.type === 'required'
                ? typeof props.label === 'string'
                  ? `${props.label} is required`
                  : 'Required'
                : error?.message
            }
            isReadOnly={props.isReadOnly || isSubmitting}
          />
        </>
      )}
    />
  )
}
