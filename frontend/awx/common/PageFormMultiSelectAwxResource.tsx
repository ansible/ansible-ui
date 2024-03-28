import { useCallback } from 'react';
import { FieldPath, FieldValues, PathValue, useFormContext, useWatch } from 'react-hook-form';
import { ITableColumn, IToolbarFilter, usePageDialog } from '../../../framework';
import { MultiSelectDialog } from '../../../framework';
import { PageAsyncSelectOptionsFn } from '../../../framework/PageInputs/PageAsyncSelectOptions';
import { useID } from '../../../framework/hooks/useID';
import { requestGet } from '../../common/crud/Data';
import { AwxItemsResponse } from './AwxItemsResponse';
import { useAwxView } from './useAwxView';
import { AwxAsyncName } from './PageFormSingleSelectAwxResource';
import { PageFormAsyncMultiSelect } from '../../../framework/PageForm/Inputs/PageFormAsyncMultiSelect';
import { QueryParams } from './useAwxView';
import { getQueryString } from './useAwxView';

export function PageFormMultiSelectAwxResource<
  Resource extends { id: number; name: string; description?: string | null | undefined },
  FormData extends FieldValues = FieldValues,
  Name extends FieldPath<FormData> = FieldPath<FormData>,
  Value extends number = PathValue<FormData, Name>,
>(props: {
  id?: string;
  name: Name;
  label: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  url: string;
  toolbarFilters?: IToolbarFilter[];
  tableColumns: ITableColumn<Resource>[];
  defaultSelection?: Value[];
  placeholder: string;
  queryPlaceholder: string;
  queryErrorText: string;
  helperText?: string;
  labelHelp?: string;
  queryParams?: QueryParams;
}) {
  const id = useID(props);

  const queryOptions = useCallback<PageAsyncSelectOptionsFn<PathValue<FormData, Name>>>(
    async (options) => {
      try {
        let url =
          props.url + `?page_size=10&order_by=name&` + getQueryString(props.queryParams || {});
        if (options.next) url = url + `&name__gt=${options.next}`;
        if (options.search) url = url + `&name__icontains=${options.search}`;
        const response = await requestGet<AwxItemsResponse<Resource>>(url, options.signal);
        return {
          remaining: response.count - response.results.length,
          options:
            response.results?.map((resource) => ({
              label: resource.name,
              value: resource.id as PathValue<FormData, Name>,
              description: resource.description,
            })) ?? [],
          next: response.results[response.results.length - 1]?.name,
        };
      } catch (error) {
        return {
          remaining: 0,
          options: [],
          next: 0,
        };
      }
    },
    [props.url, props.queryParams]
  );

  const [_, setDialog] = usePageDialog();
  const { setValue } = useFormContext<FormData>();
  const value = useWatch<FormData>({ name: props.name }) as number[];
  const openSelectDialog = useCallback(
    (onSelect: (resource: Resource[]) => void) => {
      setDialog(
        <SelectResource<Resource>
          title={props.label}
          url={props.url}
          onSelect={onSelect}
          toolbarFilters={props.toolbarFilters}
          tableColumns={props.tableColumns}
          queryParams={props.queryParams}
          defaultSelection={
            value && Array.isArray(value)
              ? value.map((item: number) => {
                  return { id: item };
                })
              : []
          }
        />
      );
    },
    [
      props.label,
      props.tableColumns,
      props.toolbarFilters,
      props.url,
      setDialog,
      value,
      props.queryParams,
    ]
  );

  const queryLabel = useCallback(
    (value: Value) => <AwxAsyncName url={props.url} id={value as unknown as number} />,
    [props.url]
  );

  return (
    <PageFormAsyncMultiSelect<FormData, Name>
      id={id}
      name={props.name}
      label={props.label}
      queryOptions={queryOptions}
      placeholder={props.placeholder}
      queryPlaceholder={props.queryPlaceholder}
      queryErrorText={props.queryErrorText}
      isRequired={props.isRequired}
      isDisabled={props.isDisabled}
      helperText={props.helperText}
      labelHelp={props.labelHelp}
      onBrowse={() =>
        openSelectDialog((resources: Resource[]) => {
          if (resources) {
            setValue(props.name, resources.map((res) => res.id) as PathValue<FormData, Name>);
          }
        })
      }
      queryLabel={queryLabel}
    />
  );
}

function SelectResource<
  Resource extends { id: number; name: string; description?: string | null | undefined },
>(props: {
  title: string;
  url: string;
  onSelect: (resource: Resource[]) => void;
  defaultSelection?: { id: number }[];
  toolbarFilters?: IToolbarFilter[];
  tableColumns: ITableColumn<Resource>[];
  queryParams?: QueryParams;
}) {
  const view = useAwxView<Resource>({
    url: props.url,
    toolbarFilters: props.toolbarFilters,
    tableColumns: props.tableColumns,
    disableQueryString: true,
    defaultSelection: props.defaultSelection as Resource[],
    queryParams: props.queryParams,
  });
  return (
    <MultiSelectDialog<Resource>
      title={props.title}
      onSelect={props.onSelect}
      toolbarFilters={props.toolbarFilters ?? []}
      tableColumns={props.tableColumns}
      view={view}
    />
  );
}
