import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ITableColumn,
  IToolbarFilter,
  TextCell,
  ToolbarFilterType,
} from '../../../../framework';
import { AnsibleAnsibleRepositoryResponse as Repository } from './../../api-schemas/generated/AnsibleAnsibleRepositoryResponse';
import { useAsyncSingleSelectFilterBuilder, useAsyncMultiSelectFilterBuilder, AsyncSelectFilterBuilderProps } from '../../../../framework/PageToolbar/PageToolbarFilters/ToolbarAsyncSelectFilterBuilder';
import { usePulpView } from '../../usePulpView';
import { pulpAPI } from '../../api/utils';

/*export function useSelectRepositorySingle() {
  const [_, setDialog] = usePageDialog();
  const { t } = useTranslation();
  const toolbarFilters = useRepositoryFilters();

  const onSelectRepository = useAsyncSingleSelectFilterBuilder<Repository>({
    toolbarFilters: useRepositoryFilters(),
  });
  return onSelectRepository;
}*/


function useParameters() : AsyncSelectFilterBuilderProps<Repository>
{ 
  const tableColumns = useRepositoryColumns();
  const toolbarFilters = useRepositoryFilters();
  const { t } = useTranslation();

  return  {
    title : t`Select Repository`,
    tableColumns,
    toolbarFilters,
    useView : usePulpView,
    viewParams : {
      url: pulpAPI`/repositories/ansible/ansible/`,
      toolbarFilters,
      tableColumns,
      disableQueryString: true,
      keyFn: (item) => item.name,
    }
  };
}

export function useSelectRepositoryMulti() {
  const params = useParameters(); 

  return useAsyncMultiSelectFilterBuilder<Repository>(
    params
  );
}

export function useSelectRepositorySingle() {
  const params = useParameters(); 

  return useAsyncSingleSelectFilterBuilder<Repository>(
    params
  );
}

/*
function SelectRepository(props: {
  title: string;
  onSelect?: (repository: Repository) => void;
  onMultiselect?: (repository: Repository[]) => void;
  defaultRepository?: Repository | Repository[];
  multiSelection: boolean;
}) {
  const toolbarFilters = useRepositoryFilters();
  const tableColumns = useRepositoryColumns();

  const view = usePulpView<Repository>({
    url: pulpAPI`/repositories/ansible/ansible/`,
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
    keyFn: (item) => item.name,
    defaultSelection: props.multiSelection
      ? (props.defaultRepository as Repository[])
      : [props.defaultRepository as Repository],
  });

  if (props.multiSelection) {
    return (
      <MultiSelectDialog<Repository>
        {...props}
        onSelect={props.onMultiselect ? props.onMultiselect : () => {}}
        toolbarFilters={toolbarFilters}
        tableColumns={tableColumns}
        view={view}
      />
    );
  } else {
    return (
      <SelectSingleDialog<Repository>
        {...props}
        onSelect={props.onSelect ? props.onSelect : () => {}}
        toolbarFilters={toolbarFilters}
        tableColumns={tableColumns}
        view={view}
      />
    );
  }
}

export function useSelectRepositorySingle() {
  const [_, setDialog] = usePageDialog();
  const { t } = useTranslation();

  const onSelectRepository = useCallback(
    (onSelect: (value: Repository) => void, defaultSelection?: Repository) => {
      setDialog(
        <SelectRepository
          title={t('Select organization')}
          onSelect={onSelect}
          defaultRepository={defaultSelection}
          multiSelection={false}
        />
      );
    },
    [setDialog, t]
  );
  return onSelectRepository;
}

export function useSelectRepositoryMulti() {
  const [_, setDialog] = usePageDialog();
  const { t } = useTranslation();

  const onSelectRepository = useCallback(
    (onSelect: (value: Repository[]) => void, defaultSelection?: Repository[]) => {
      setDialog(
        <SelectRepository
          title={t('Select organization')}
          defaultRepository={defaultSelection}
          multiSelection={true}
          onMultiselect={onSelect}
        />
      );
    },
    [setDialog, t]
  );
  return onSelectRepository;
}
*/

export function useRepositoryColumns(_options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const { t } = useTranslation();
  return useMemo<ITableColumn<Repository>[]>(
    () => [
      {
        header: t('Name'),
        value: (repo) => repo.name,
        cell: (repo) => <TextCell text={repo.name} />,
      },

      {
        header: t('Description'),
        type: 'description',
        value: (repo) => repo.description,
      },
    ],
    [t]
  );
}

export function useRepositoryFilters() {
  const { t } = useTranslation();

  return useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'keywords',
        label: t('Name'),
        type: ToolbarFilterType.Text,
        query: 'name',
        comparison: 'equals',
      },
    ],
    [t]
  );
}
