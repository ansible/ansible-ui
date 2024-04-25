import { useCallback, useMemo } from 'react';
import { FieldPath, FieldValues, PathValue, useFormContext, useWatch } from 'react-hook-form';
import { ITableColumn, IToolbarFilter, MultiSelectDialog, usePageDialog } from '../../../framework';
import { PageFormAsyncMultiSelect } from '../../../framework/PageForm/Inputs/PageFormAsyncMultiSelect';
import { PageAsyncSelectOptionsFn } from '../../../framework/PageInputs/PageAsyncSelectOptions';
import { AsyncQueryLabel } from '../../../framework/components/AsyncQueryLabel';
import { useID } from '../../../framework/hooks/useID';
import { requestGet } from '../../common/crud/Data';
import { AwxItemsResponse } from './AwxItemsResponse';
import { QueryParams, useAwxView } from './useAwxView';

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
  isDisabled?: string;
  url: string;
  toolbarFilters?: IToolbarFilter[];
  tableColumns: ITableColumn<Resource>[];
  defaultSelection?: Value[];
  placeholder: string;
  queryPlaceholder: string;
  queryErrorText: string;
  helperText?: string;
  additionalControls?: React.ReactNode;
  labelHelp?: string;
  queryParams?: QueryParams;
}) {
  const id = useID(props);

  const queryOptions = useCallback<PageAsyncSelectOptionsFn<PathValue<FormData, Name>>>(
    async (options) => {
      try {
        const baseUrl = props.url.split('?')[0];
        const queryString = props.url.split('?')[1];
        const urlSearchParams = new URLSearchParams(queryString);
        urlSearchParams.delete('page_size');
        urlSearchParams.set('page_size', '10');
        urlSearchParams.delete('order_by');
        urlSearchParams.set('order_by', 'name');
        if (props.queryParams) {
          for (const [key, value] of Object.entries(props.queryParams)) {
            if (Array.isArray(value)) {
              for (const subVal of value) {
                urlSearchParams.set(key, subVal);
              }
            } else {
              urlSearchParams.set(key, value);
            }
          }
        }
        if (options.next) urlSearchParams.set('name__gt', options.next.toString());
        if (options.search) urlSearchParams.set('name__icontains', options.search);
        const response = await requestGet<AwxItemsResponse<Resource>>(
          baseUrl + '?' + decodeURIComponent(urlSearchParams.toString()),
          options.signal
        );
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
  const value = useWatch<FormData>({ name: props.name }) as Value[];
  const openSelectDialog = useCallback(
    (onSelect: (resources: Resource[]) => void) => {
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
    (value: Value) => (
      <AsyncQueryLabel url={props.url.split('?')[0]} id={value as unknown as number} />
    ),
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
      additionalControls={props.additionalControls}
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
  const urlSearchParams = useMemo(() => new URLSearchParams(props.url.split('?')[1]), [props.url]);

  const queryParams = useMemo(() => {
    const query: QueryParams = {};
    urlSearchParams.forEach((value, key) => (query[key] = value));
    return query;
  }, [urlSearchParams]);

  const view = useAwxView<Resource>({
    url: props.url.split('?')[0],
    toolbarFilters: props.toolbarFilters,
    tableColumns: props.tableColumns,
    disableQueryString: true,
    defaultSelection: props.defaultSelection as Resource[],
    queryParams,
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
