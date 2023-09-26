import { Controller, FieldPath, FieldValues, useFormContext } from 'react-hook-form';
import { FormGroupDateTimePicker } from './FormGroupDateTimePicker';

export type PageFormDateTimePickerProps<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TFieldName;
  datePlaceHolder?: string;
  timePlaceHolder?: string;
  label: string;
  labelHelp?: string;
  labelHelpTitle?: string;
  isDisabled?: boolean;
};
export function PageFormDateTimePicker<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
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
              id="dateTime"
              data-cy="dateTime"
              dateValue={field?.value?.date as string}
              timeValue={field?.value?.time as string}
              onDateChange={(date: string) => field.onChange({ ...field.value, date })}
              datePlaceHolder={props.datePlaceHolder}
              onTimeChange={(_event, time: string) => {
                field.onChange({ ...field.value, time });
              }}
              timePlaceHolder={props.timePlaceHolder}
            />
          </>
        );
      }}
    />
  );
}
