import { Controller, FieldPath, FieldValues, useFormContext } from 'react-hook-form';
import { FormGroupDateTimePicker } from './FormGroupDateTimePicker';

export type PageFormDateTimePickerProps<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TFieldName;
  datePlaceHolder?: string;
  timePlaceHolder?: string;
  label: string;
};
export function PageFormDateTimePicker<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(props: PageFormDateTimePickerProps<TFieldValues, TFieldName>) {
  const { control } = useFormContext<TFieldValues>();

  return (
    <Controller<TFieldValues, TFieldName>
      name={props.name}
      control={control}
      shouldUnregister
      render={({ field }) => {
        return (
          <>
            <FormGroupDateTimePicker
              {...props}
              id="startDateTime"
              dateValue={field.value.startDate as string}
              timeValue={field.value.startTime as string}
              onDateChange={(value: string) => field.onChange({ ...field.value, startDate: value })}
              datePlaceHolder={props.datePlaceHolder}
              onTimeChange={(event: React.FormEvent<HTMLInputElement>, time: string) =>
                field.onChange({ ...field.value, startTime: time })
              }
              timePlaceHolder={props.timePlaceHolder}
            />
          </>
        );
      }}
    />
  );
}
