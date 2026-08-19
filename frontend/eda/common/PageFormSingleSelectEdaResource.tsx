import {
  ITableColumn,
  IToolbarFilter,
  QueryParams,
  usePageDialog,
} from '@ansible/ansible-ui-framework';
import { SingleSelectDialog } from '@ansible/ansible-ui-framework/PageDialogs/SingleSelectDialog';
import { PageFormAsyncSingleSelect } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormAsyncSingleSelect';
import { PageAsyncSelectOptionsFn } from '@ansible/ansible-ui-framework/PageInputs/PageAsyncSelectOptions';
import { useID } from '@ansible/ansible-ui-framework/hooks/useID';
import { requestGet } from '@ansible/common-ui/crud/Data';
import { useGetItem } from '@ansible/common-ui/crud/useGet';
import { Spinner } from '@patternfly/react-core';
import { useCallback, useMemo } from 'react';
import { FieldPath, FieldValues, PathValue, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { EdaItemsResponse } from './EdaItemsResponse';
import { useEdaView } from './useEventDrivenView';

export function getDefaultResourceDescription(description: string | null | undefined): string {
  if (!description) {
    return '';
  }
  const dotIndex = description.indexOf('.');
  return description.slice(0, dotIndex === -1 ? undefined : dotIndex);
}

export function PageFormSingleSelectEdaResource<
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
  queryParams?: QueryParams;
  queryPlaceholder: string;
  queryErrorText: string;
  toolbarFilters?: IToolbarFilter[];
  tableColumns: ITableColumn<Resource>[];
  defaultSelection?: Value[];
  placeholder: string;
  helperText?: string;
  labelHelp?: string | React.ReactNode;
  getOptionDescription?: (resource: Resource) => string;
}) {
  const id = useID(props);
  const { url, queryParams: propsQueryParams, getOptionDescription } = props;

  const queryOptions = useCallback<PageAsyncSelectOptionsFn<PathValue<FormData, Name>>>(
    async (options) => {
      try {
        const baseUrl = url.split('?')[0];
        const queryParams = url.split('?')[1];
        const urlSearchParameters = new URLSearchParams(queryParams);
        urlSearchParameters.delete('page_size');
        urlSearchParameters.set('page_size', options?.next ? `${options.next}` : '10');
        urlSearchParameters.delete('order_by');
        urlSearchParameters.set('order_by', 'name');
        if (propsQueryParams) {
          for (const [key, value] of Object.entries(propsQueryParams)) {
            if (Array.isArray(value)) {
              for (const subValue of value) {
                urlSearchParameters.set(key, subValue);
              }
            } else {
              urlSearchParameters.set(key, value);
            }
          }
        }
        if (options.search) urlSearchParameters.set('name', options.search);
        const response = await requestGet<EdaItemsResponse<Resource>>(
          baseUrl + '?' + decodeURIComponent(urlSearchParameters.toString()),
          options.signal
        );
        return {
          remaining: response.count - response.results.length,
          options:
            response.results?.map((resource) => {
              const description = getOptionDescription
                ? getOptionDescription(resource)
                : getDefaultResourceDescription(resource?.description);
              return {
                value: resource.id as PathValue<FormData, Name>,
                description,
                label: resource.name,
              };
            }) ?? [],
          next: response.count,
        };
      } catch (error) {
        return {
          next: 0,
          remaining: 0,
          options: [],
        };
      }
    },
    [url, propsQueryParams, getOptionDescription]
  );

  const [_, setDialog] = usePageDialog();
  const { setValue } = useFormContext<FormData>();
  const value = useWatch<FormData>({ name: props.name });
  const openSelectDialog = useCallback(
    (onSelect: (resource: Resource) => void) => {
      setDialog(
        <SelectResource<Resource>
          title={props.label}
          url={props.url}
          onSelect={onSelect}
          toolbarFilters={props.toolbarFilters}
          tableColumns={props.tableColumns}
          defaultSelection={value ? [{ id: value }] : []}
          queryParams={props.queryParams}
        />
      );
    },
    [
      props.url,
      props.queryParams,
      props.tableColumns,
      props.toolbarFilters,
      props.label,
      setDialog,
      value,
    ]
  );

  const queryLabel = useCallback(
    (value: Value) => <EdaAsyncName url={props.url} id={value as unknown as number} />,
    [props.url]
  );

  return (
    <PageFormAsyncSingleSelect<FormData, Name>
      id={id}
      name={props.name}
      label={props.label}
      isDisabled={props.isDisabled}
      isRequired={props.isRequired}
      queryOptions={queryOptions}
      placeholder={props.placeholder}
      queryPlaceholder={props.queryPlaceholder}
      queryErrorText={props.queryErrorText}
      labelHelp={props.labelHelp}
      helperText={props.helperText}
      onBrowse={() =>
        openSelectDialog((resource) =>
          setValue(props.name, resource.id as PathValue<FormData, Name>)
        )
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
  onSelect: (resource: Resource) => void;
  defaultSelection?: { id: number }[];
  toolbarFilters?: IToolbarFilter[];
  tableColumns: ITableColumn<Resource>[];
  queryParams?: QueryParams;
}) {
  const urlSearchParams = useMemo(() => new URLSearchParams(props.url.split('?')[1]), [props.url]);

  const queryParameters = useMemo(() => {
    const query: QueryParams = {};
    urlSearchParams.forEach((value, key) => (query[key] = value));
    return query;
  }, [urlSearchParams]);

  const view = useEdaView<Resource>({
    url: props.url.split('?')[0],
    queryParams: props.queryParams ?? queryParameters,
    toolbarFilters: props.toolbarFilters,
    tableColumns: props.tableColumns,
    defaultSelection: props.defaultSelection as Resource[],
    disableQueryString: true,
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

function EdaAsyncName(props: { url: string; id: number; nameProp?: string }) {
  const { t } = useTranslation();
  const baseUrl = props.url.split('?')[0];
  const { data, isLoading, error } = useGetItem<Record<string, string>>(baseUrl, props.id);
  if (isLoading) return <Spinner size="md" />;
  if (error) return t('Not found');
  if (!data) return t('Not found');
  return data[props.nameProp ?? 'name'];
}
