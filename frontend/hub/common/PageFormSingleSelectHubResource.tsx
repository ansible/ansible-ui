import {
  ITableColumn,
  IToolbarFilter,
  usePageDialog,
  QueryParams,
  PageSelectOption,
} from '@ansible/ansible-ui-framework';
import { SingleSelectDialog } from '@ansible/ansible-ui-framework/PageDialogs/SingleSelectDialog';
import { PageFormAsyncSingleSelect } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormAsyncSingleSelect';
import { PageAsyncSelectOptionsFn } from '@ansible/ansible-ui-framework/PageInputs/PageAsyncSelectOptions';
import { useID } from '@ansible/ansible-ui-framework/hooks/useID';
import { requestGet } from '@ansible/common-ui/crud/Data';
import { useCallback, useMemo } from 'react';
import {
  FieldPath,
  FieldPathByValue,
  FieldValues,
  PathValue,
  useFormContext,
  useWatch,
} from 'react-hook-form';
import { HubItemsResponse, PulpItemsResponse, useHubView } from './useHubView';

export function PageFormSingleSelectHubResource<
  Resource extends { name: string },
  FormData extends FieldValues = FieldValues,
  Name extends FieldPath<FormData> = FieldPath<FormData>,
  Value extends number = PathValue<FormData, Name>,
  FieldName extends FieldPathByValue<FieldValues, number> = FieldPathByValue<FieldValues, number>,
>(
  props: Readonly<{
    id?: string;
    description?: string;
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
  }>
) {
  const id = useID(props);
  const queryOptions = useCallback<PageAsyncSelectOptionsFn<PathValue<FormData, Name>>>(
    async (options) => {
      try {
        const baseUrl = props.url.split('?')[0];
        const queryString = props.url.split('?')[1];
        const urlSearchParams = new URLSearchParams(queryString);
        urlSearchParams.delete('page_size');
        urlSearchParams.set('page_size', '10');
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
        let response;
        if (props.name === 'remote') {
          response = await requestGet<PulpItemsResponse<Resource>>(
            baseUrl + '?' + decodeURIComponent(urlSearchParams.toString()),
            options.signal
          );
          return {
            remaining: response.count - response.results.length,
            options:
              response.results?.map((resource) => ({
                label: resource.name,
                value: resource as PathValue<FormData, Name>,
              })) ?? [],
            next: response.results[response.results.length - 1]?.name,
          };
        }
        // props.name === 'registry'
        response = await requestGet<HubItemsResponse<Resource>>(
          baseUrl + '?' + decodeURIComponent(urlSearchParams.toString()),
          options.signal
        );

        return {
          remaining: response.meta.count - response.data.length,
          options:
            response.data?.map((resource) => ({
              label: resource.name,
              value: resource as PathValue<FormData, Name>,
            })) ?? [],
          next: response.data[response.data.length - 1]?.name,
        };
      } catch (error) {
        return {
          remaining: 0,
          options: [],
          next: 0,
        };
      }
    },
    [props.url, props.queryParams, props.name]
  );

  const [_, setDialog] = usePageDialog();

  const { setValue } = useFormContext<FormData>();
  const { registry, remote } = useWatch<FormData>();

  const value = useMemo<string>(() => {
    if (props.name === 'remote') {
      /* eslint-disable @typescript-eslint/no-unsafe-member-access*/
      /* eslint-disable @typescript-eslint/no-unsafe-return*/
      return remote?.name;
    }
    return registry?.name;
  }, [props.name, registry?.name, remote?.name]);

  const openSelectDialog = useCallback(
    (onSelect: (resource: Resource) => void) => {
      setDialog(
        <SelectResource<Resource>
          title={props.label}
          url={props.url}
          onSelect={onSelect}
          toolbarFilters={props.toolbarFilters}
          tableColumns={props.tableColumns}
          defaultSelection={value ? [{ name: value }] : []}
          queryParams={props.queryParams}
        />
      );
    },
    [
      setDialog,
      props.label,
      props.url,
      props.toolbarFilters,
      props.tableColumns,
      props.queryParams,
      value,
    ]
  );

  const writeInOption = useCallback(
    (searchString: string) =>
      ({
        label: searchString,
        value: searchString,
      }) as PageSelectOption<PathValue<FieldValues, FieldName>>,
    []
  );

  return (
    <PageFormAsyncSingleSelect<FormData, Name>
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
        openSelectDialog((resource) => setValue(props.name, resource as PathValue<FormData, Name>))
      }
      queryLabel={(value: Resource) => value.name}
      additionalControls={props.additionalControls}
      writeInOption={writeInOption}
    />
  );
}

function SelectResource<Resource extends { name: string }>(
  props: Readonly<{
    title: string;
    url: string;
    onSelect: (resource: Resource) => void;
    defaultSelection?: { name: string }[];
    toolbarFilters?: IToolbarFilter[];
    tableColumns: ITableColumn<Resource>[];
    queryParams?: QueryParams;
  }>
) {
  const urlSearchParams = useMemo(() => new URLSearchParams(props.url.split('?')[1]), [props.url]);
  const queryParams = useMemo(() => {
    const query: QueryParams = {};
    urlSearchParams.forEach((value, key) => (query[key] = value));
    return query;
  }, [urlSearchParams]);

  const view = useHubView<Resource>({
    url: props.url.split('?')[0],
    toolbarFilters: props.toolbarFilters,
    tableColumns: props.tableColumns,
    keyFn: (v) => v.name,
    disableQueryString: true,
    defaultSelection: props.defaultSelection as Resource[],
    queryParams: props.queryParams ?? queryParams,
  });

  return (
    <SingleSelectDialog<Resource>
      title={props.title}
      onSelect={props.onSelect}
      toolbarFilters={props.toolbarFilters ?? []}
      tableColumns={props.tableColumns}
      view={view}
    />
  );
}
