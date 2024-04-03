import { Controller, FieldPath, FieldValues, useFormContext } from 'react-hook-form';
import { PageSelectOption } from '../../PageInputs/PageSelectOption';
import { PageToggleGroup } from '../../PageInputs/PageToggleGroup';
import { useID } from '../../hooks/useID';

export type PageFormToggleGroupProps<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TSelection = unknown,
> = {
  id?: string;
  name: TFieldName;
  options: PageSelectOption<TSelection>[];
};

export function PageFormToggleGroup<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TSelection = unknown,
>(props: PageFormToggleGroupProps<TFieldValues, TFieldName, TSelection>) {
  const { name, options } = props;
  const id = useID(props);
  const { control } = useFormContext<TFieldValues>();
  return (
    <Controller<TFieldValues, TFieldName>
      name={name}
      control={control}
      shouldUnregister
      render={({ field: { onChange, value } }) => {
        return <PageToggleGroup id={id} value={value} onSelect={onChange} options={options} />;
      }}
    />
  );
}
