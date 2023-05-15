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
import { SearchIcon, SyncAltIcon } from '@patternfly/react-icons';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Controller,
  FieldPath,
  FieldPathValue,
  FieldValues,
  useFormContext,
} from 'react-hook-form';
import { useFrameworkTranslations } from '../../useFrameworkTranslations';
import { capitalizeFirstLetter } from '../../utils/strings';
import { PageFormGroup } from './PageFormGroup';

export interface PageFormAsyncSelectProps<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  SelectionType = unknown
> {
  id?: string;
  name: TFieldName;
  label: string;
  labelHelp?: string | ReactNode;
  labelHelpTitle?: string;
  placeholder: string;
  loadingPlaceholder: string;
  loadingErrorText: string;
  query: (page: number) => Promise<{ total: number; values: SelectionType[] }>;
  valueToString: (value: SelectionType | undefined) => string;
  valueToDescription?: (value: SelectionType | undefined) => ReactNode;
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
    isRequired,
    label,
    loadingErrorText,
    loadingPlaceholder,
    name,
    openSelectDialog,
    placeholder,
    query,
    valueToString,
    valueToDescription,
    labelHelp,
    labelHelpTitle,
  } = props;
  const id = props.id ?? name.split('.').join('-');

  const {
    control,
    setValue,
    formState: { isSubmitting },
  } = useFormContext<TFieldValues>();

  const [loadingError, setLoadingError] = useState<Error>();

  const [frameworkTranslations] = useFrameworkTranslations();

  const queryHandler = useCallback(
    (page: number) => {
      setValue(name, undefined as FieldPathValue<TFieldValues, TFieldName>);
      setLoadingError(undefined);
      return query(page)
        .then((result) => {
          if (result.total === 1 && result.values.length === 1) {
            setValue(name, result.values[0] as FieldPathValue<TFieldValues, TFieldName>);
          }
          return result;
        })
        .catch((err) => {
          err instanceof Error
            ? setLoadingError(err)
            : setLoadingError(new Error(frameworkTranslations.unknownError));
          return { total: 0, values: [] };
        });
    },
    [frameworkTranslations.unknownError, name, query, setValue]
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
            labelHelp={labelHelp}
            labelHelpTitle={labelHelpTitle}
            helperTextInvalid={loadingError ? loadingErrorText : error?.message}
            isRequired={isRequired}
          >
            <AsyncSelect<SelectionType>
              id={id}
              query={queryHandler}
              valueToString={valueToString}
              valueToDescription={valueToDescription}
              placeholder={placeholder}
              loadingPlaceholder={loadingPlaceholder}
              value={value}
              onSelect={onChange}
              isReadOnly={props.isReadOnly || isSubmitting}
              validated={loadingError?.message || error?.message ? 'error' : undefined}
              isRequired={isRequired}
              limit={props.limit}
              openSelectDialog={openSelectDialog}
              loadingError={!!loadingError}
              labeledBy={`${id ?? ''}-form-group`}
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
  valueToDescription?: (value: SelectionType | undefined) => ReactNode;
  onSelect: (value: SelectionType | undefined) => void;
  query: (pageSize: number) => Promise<{ total: number; values: SelectionType[] }>;
  placeholder: string;
  loadingPlaceholder: string;
  labeledBy?: string;
  isReadOnly?: boolean;
  helperTextInvalid?: string;
  validated?: 'success' | 'warning' | 'error' | 'default';
  showRefreshButton?: boolean;
  isRequired?: boolean;
  limit: number;
  loadingError?: boolean;
  openSelectDialog?: (
    onSelect: (value: SelectionType | undefined) => void,
    defaultSelection?: SelectionType
  ) => void;
}

export function AsyncSelect<SelectionType>(props: AsyncSelectProps<SelectionType>) {
  const {
    id,
    isReadOnly,
    labeledBy,
    loadingError,
    loadingPlaceholder,
    onSelect,
    placeholder,
    query,
    validated,
  } = props;

  const [open, setOpen] = useState(false);

  const [valueToString] = useState(() => props.valueToString);
  const [valueToDescription] = useState(() => props.valueToDescription);

  const value = useMemo(() => {
    if (!props.value) return undefined;
    return new AsyncSelectSelectOptionObject(props.value, valueToString);
  }, [props.value, valueToString]);

  const [options, setOptions] = useState<SelectOptionObject[] | null>(null);
  const [useSelectDialog, setUseSelectDialog] = useState(false);

  const [frameworkTranslations] = useFrameworkTranslations();

  const [loading, setLoading] = useState(false);
  const reload = useCallback(() => {
    setLoading((loading) => {
      if (loading) return loading;
      setOptions([]);
      query(props.limit)
        .then((result) => {
          if (result.total === 1 && result.values.length === 1) {
            onSelect(result.values[0]);
          }
          if (result.total > props.limit) {
            setUseSelectDialog(true);
            setOptions([]);
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
  }, [onSelect, props.limit, query, valueToString]);

  useEffect(reload, [reload]);

  const onFilter = useCallback(
    (_: unknown, filterValue: string) =>
      (options ?? [])
        .filter((option) => {
          if (!filterValue) return true;
          if (option instanceof AsyncSelectSelectOptionObject<SelectionType>) {
            return option.toString().toLowerCase().indexOf(filterValue.toLowerCase()) !== -1;
          }
          return false;
        })
        .map((option) => (
          <SelectOption
            key={option.toString()}
            value={option}
            description={
              option instanceof AsyncSelectSelectOptionObject<SelectionType> && option.option
                ? valueToDescription?.(option.option as SelectionType)
                : undefined
            }
          >
            {option.toString()}
          </SelectOption>
        )),
    [options, valueToDescription]
  );

  return (
    <InputGroup>
      <Select
        toggleId={id}
        aria-labelledby={labeledBy}
        variant={SelectVariant.single}
        hasPlaceholderStyle
        placeholderText={
          loadingError
            ? frameworkTranslations.clickToRefresh
            : loadingPlaceholder
            ? loading
              ? loadingPlaceholder
              : placeholder
            : placeholder
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
          if (loadingError) {
            reload();
            return;
          }
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
        toggleIndicator={
          loading ? (
            <Spinner size="md" style={{ margin: -1, marginBottom: -3 }} />
          ) : loadingError ? (
            <SyncAltIcon />
          ) : useSelectDialog ? (
            <SearchIcon />
          ) : undefined
        }
        validated={validated}
        isDisabled={options === null || loading || isReadOnly}
        onFilter={onFilter}
        hasInlineFilter={options !== null && options.length > 10}
        menuAppendTo="parent"
        maxHeight={'45vh'}
        footer={
          props.openSelectDialog ? (
            <Button
              variant="link"
              onClick={() => {
                setOpen(false);
                props.openSelectDialog?.(onSelect, props.value);
              }}
            >
              Browse
            </Button>
          ) : undefined
        }
      >
        {(options ?? []).map((option) => (
          <SelectOption
            key={option.toString()}
            value={option}
            description={
              option instanceof AsyncSelectSelectOptionObject<SelectionType> && option.option
                ? valueToDescription?.(option.option as SelectionType)
                : undefined
            }
          >
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
