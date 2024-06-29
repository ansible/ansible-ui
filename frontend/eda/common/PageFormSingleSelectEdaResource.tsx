import { Spinner } from '@patternfly/react-core';
import { useCallback, useMemo } from 'react';
import { FieldPath, FieldValues, PathValue, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ITableColumn, IToolbarFilter, QueryParams, usePageDialog } from '../../../framework';
import { SingleSelectDialog } from '../../../framework/PageDialogs/SingleSelectDialog';
import { PageFormAsyncSingleSelect } from '../../../framework/PageForm/Inputs/PageFormAsyncSingleSelect';
import { PageAsyncSelectOptionsFn } from '../../../framework/PageInputs/PageAsyncSelectOptions';
import { useID } from '../../../framework/hooks/useID';
import { requestGet } from '../../common/crud/Data';
import { useGetItem } from '../../common/crud/useGet';
import { useEdaView } from './useEventDrivenView';
import { EdaItemsResponse } from './EdaItemsResponse';

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
        if (options.search) urlSearchParams.set('name__icontains', options.search);
        const response = await requestGet<EdaItemsResponse<Resource>>(
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
          next: response.count,
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
    (value: Value) => <EdaAsyncName url={props.url} id={value as unknown as number} />,
    [props.url]
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
        openSelectDialog((resource) =>
          setValue(props.name, resource.id as PathValue<FormData, Name>)
        )
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
  onSelect: (resource: Resource) => void;
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

  const view = useEdaView<Resource>({
    url: props.url.split('?')[0],
    toolbarFilters: props.toolbarFilters,
    tableColumns: props.tableColumns,
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

function EdaAsyncName(props: { url: string; id: number; nameProp?: string }) {
  const { t } = useTranslation();
  const { data, isLoading, error } = useGetItem<Record<string, string>>(props.url, props.id);
  if (isLoading) return <Spinner size="md" />;
  if (error) return t('Not found');
  if (!data) return t('Not found');
  return data[props.nameProp ?? 'name'];
}
