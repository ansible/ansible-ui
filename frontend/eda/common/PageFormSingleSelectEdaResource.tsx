import { Spinner } from '@patternfly/react-core';
import { useCallback } from 'react';
import { FieldPath, FieldValues, PathValue, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ITableColumn, IToolbarFilter, usePageDialog } from '../../../framework';
import { SingleSelectDialog } from '../../../framework/PageDialogs/SingleSelectDialog';
import { PageFormAsyncSingleSelect } from '../../../framework/PageForm/Inputs/PageFormAsyncSingleSelect';
import { PageAsyncSelectOptionsFn } from '../../../framework/PageInputs/PageAsyncSelectOptions';
import { useID } from '../../../framework/hooks/useID';
import { requestGet } from '../../common/crud/Data';
import { useGetItem } from '../../common/crud/useGet';
import { EdaItemsResponse } from './EdaItemsResponse';
import { useEdaView } from './useEventDrivenView';

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
}) {
  const id = useID(props);

  const queryOptions = useCallback<PageAsyncSelectOptionsFn<PathValue<FormData, Name>>>(
    async (options) => {
      try {
        let url = props.url + `?order_by=name&page_size=${options?.next || 10}`;
        if (options.search) url = url + `&name__icontains=${options.search}`;
        const response = await requestGet<EdaItemsResponse<Resource>>(url, options?.signal);
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
    [props.url]
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
        />
      );
    },
    [props.label, props.tableColumns, props.toolbarFilters, props.url, setDialog, value]
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
}) {
  const view = useEdaView<Resource>({
    url: props.url,
    toolbarFilters: props.toolbarFilters,
    tableColumns: props.tableColumns,
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
  const { data, isLoading, error } = useGetItem<Record<string, string>>(props.url, props.id);
  if (isLoading) return <Spinner size="md" />;
  if (error) return t('Not found');
  if (!data) return t('Not found');
  return data[props.nameProp ?? 'name'];
}
