/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Button,
  InputGroup,
  Select,
  SelectOption,
  SelectOptionObject,
  SelectVariant,
  Spinner,
} from '@patternfly/react-core';
import { SyncAltIcon } from '@patternfly/react-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Controller,
  FieldPath,
  FieldPathValue,
  FieldValues,
  useFormContext,
} from 'react-hook-form';
import { capitalizeFirstLetter } from '../../utils/capitalize';
import { PageFormGroup } from './PageFormGroup';

export interface PageFormAsyncSelectProps<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  SelectionType = unknown
> {
  id?: string;
  name: TFieldName;
  label: string;
  placeholder: string;
  loadingPlaceholder: string;
  query: (page: number) => Promise<{ total: number; values: SelectionType[] }>;
  valueToString: (value: SelectionType | undefined) => string;
  isRequired?: boolean;
  isReadOnly?: boolean;
  openSelectDialog?: (
    onSelect: (value: SelectionType | undefined) => void,
    defaultSelection?: SelectionType
  ) => void;
  limit: number;
}

export function PageFormAsyncSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  SelectionType = any
>(props: PageFormAsyncSelectProps<TFieldValues, TFieldName, SelectionType>) {
  const {
    name,
    label,
    query,
    valueToString,
    isRequired,
    placeholder,
    loadingPlaceholder,
    openSelectDialog,
  } = props;
  const id = props.id ?? name;

  const {
    control,
    setValue,

    formState: { isSubmitting },
  } = useFormContext<TFieldValues>();

  const queryHandler = useCallback(
    (page: number) =>
      query(page).then((result) => {
        if (result.total === 1 && result.values.length === 1) {
          setValue(name, result.values[0] as FieldPathValue<TFieldValues, TFieldName>);
        }
        return result;
      }),
    [name, query, setValue]
  );

  return (
    <Controller<TFieldValues, TFieldName>
      name={name}
      control={control}
      shouldUnregister
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        return (
          <PageFormGroup
            id={id}
            label={label}
            helperTextInvalid={error?.message}
            isRequired={isRequired}
          >
            <AsyncSelect<SelectionType>
              id={id}
              query={queryHandler}
              valueToString={valueToString}
              placeholder={placeholder}
              loadingPlaceholder={loadingPlaceholder}
              value={value}
              onSelect={onChange}
              isReadOnly={props.isReadOnly || isSubmitting}
              validated={error?.message ? 'error' : undefined}
              isRequired={isRequired}
              limit={props.limit}
              openSelectDialog={openSelectDialog}
            />
          </PageFormGroup>
        );
      }}
      rules={{
        required:
          typeof label === 'string' && isRequired === true
            ? {
                value: true,
                message: `${capitalizeFirstLetter(label.toLocaleLowerCase())} is required.`,
              }
            : undefined,
      }}
    />
  );
}

export interface AsyncSelectProps<SelectionType> {
  id?: string;
  value: SelectionType | undefined;
  valueToString: (value: SelectionType | undefined) => string;
  onSelect: (value: SelectionType | undefined) => void;
  query: (page: number) => Promise<{ total: number; values: SelectionType[] }>;
  placeholder: string;
  loadingPlaceholder: string;
  labeledBy?: string;
  isReadOnly?: boolean;
  helperTextInvalid?: string;
  validated?: 'success' | 'warning' | 'error' | 'default';
  showRefreshButton?: boolean;
  isRequired?: boolean;
  limit: number;
  openSelectDialog?: (
    onSelect: (value: SelectionType | undefined) => void,
    defaultSelection?: SelectionType
  ) => void;
}

export function AsyncSelect<SelectionType>(props: AsyncSelectProps<SelectionType>) {
  const {
    id,
    onSelect,
    placeholder,
    loadingPlaceholder,
    labeledBy,
    valueToString,
    query,
    validated,
  } = props;

  const [open, setOpen] = useState(false);

  const value = useMemo(() => {
    if (!props.value) return undefined;
    return new AsyncSelectSelectOptionObject(props.value, valueToString);
  }, [props.value, valueToString]);

  const [options, setOptions] = useState<SelectOptionObject[]>([]);
  const [useSelectDialog, setUseSelectDialog] = useState(false);

  const [loading, setLoading] = useState(false);
  const reload = useCallback(() => {
    setLoading((loading) => {
      if (loading) return loading;
      query(props.limit)
        .then((result) => {
          if (result.total > props.limit) {
            setUseSelectDialog(true);
          } else {
            setUseSelectDialog(false);
            setOptions(
              result.values.map((value) => new AsyncSelectSelectOptionObject(value, valueToString))
            );
          }
        })
        .catch(() => null)
        .finally(() => setLoading(false));
      return true;
    });
  }, [props.limit, query, valueToString]);

  useEffect(reload, [reload]);

  const onFilter = useCallback(
    (_: unknown, filterValue: string) =>
      options
        .filter((option) => {
          if (!filterValue) return true;
          if (option instanceof AsyncSelectSelectOptionObject<SelectionType>) {
            return option.toString().toLowerCase().indexOf(filterValue.toLowerCase()) !== -1;
          }
          return false;
        })
        .map((option) => (
          <SelectOption key={option.toString()} value={option}>
            {option.toString()}
          </SelectOption>
        )),
    [options]
  );

  return (
    <InputGroup>
      <Select
        id={id}
        aria-labelledby={labeledBy}
        variant={SelectVariant.single}
        placeholderText={
          <span style={{ opacity: 0.7 }}>
            {loadingPlaceholder ? (
              loading ? (
                <span>
                  <Spinner
                    size="md"
                    style={{ marginTop: -1, marginBottom: -3, marginRight: 10, marginLeft: 2 }}
                  />
                  {loadingPlaceholder}
                </span>
              ) : (
                placeholder
              )
            ) : (
              placeholder
            )}
          </span>
        }
        typeAheadAriaLabel={placeholder}
        selections={value}
        onSelect={(_, value) => {
          if (value instanceof AsyncSelectSelectOptionObject<SelectionType>) {
            onSelect(value.option as SelectionType);
            setOpen(false);
          }
        }}
        onClear={value && !props.isRequired ? () => onSelect(undefined) : undefined}
        isOpen={open}
        onToggle={(open) => {
          if (open) {
            if (useSelectDialog && props.openSelectDialog) {
              props.openSelectDialog(onSelect, props.value);
            } else {
              setOpen(true);
            }
          } else {
            setOpen(false);
          }
        }}
        validated={validated}
        isDisabled={loading}
        onFilter={onFilter}
        hasInlineFilter={true}
      >
        {options.map((option) => (
          <SelectOption key={option.toString()} value={option}>
            {option.toString()}
          </SelectOption>
        ))}
      </Select>

      {props.showRefreshButton && loading === false ? (
        <Button variant="control" onClick={reload}>
          <SyncAltIcon />
        </Button>
      ) : (
        <></>
      )}
      {props.showRefreshButton && loading === true ? (
        <Button variant="control" isDisabled>
          <Spinner size="md" style={{ margin: -1, marginBottom: -3 }} />
        </Button>
      ) : (
        <></>
      )}
    </InputGroup>
  );
}

class AsyncSelectSelectOptionObject<SelectionType> implements SelectOptionObject {
  constructor(public option: SelectionType, private asString: (option: SelectionType) => string) {}

  toString() {
    return this.asString(this.option);
  }

  compareTo(selectOption: AsyncSelectSelectOptionObject<SelectionType>) {
    return this.toString() === selectOption.toString();
  }
}
