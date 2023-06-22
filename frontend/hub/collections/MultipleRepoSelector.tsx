import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { nameKeyFn, usePulpView } from '../usePulpView';
import { IToolbarFilter } from '../../../framework';

import {
  DateTimeCell,
  IPageAction,
  ITableColumn,
  PageActionSelection,
  PageActionType,
  PageHeader,
  PageLayout,
  PageTab,
  PageTable,
  PageTabs,
  TextCell,
} from '../../../framework';

interface IProps {}

export interface Repository {
  name: string;
  description?: string;
  pulp_id: string;
  pulp_last_updated: string;
  content_count: number;
  gpgkey: string | null;
}

export const MultipleRepoSelector = (props: IProps) => {
  const { t } = useTranslation();
  const toolbarFilters = useRepoFilters();

  // const navigate = useNavigate()
  const tableColumns = useRepositoriesColumns();
  const view = usePulpView<Repository>(
    '/api/automation-hub/pulp/api/v3/repositories/ansible/ansible/',
    nameKeyFn,
    undefined,
    tableColumns
  );

  return (
    <PageTable<Repository>
      tableColumns={tableColumns}
      toolbarFilters={toolbarFilters}
      errorStateTitle={t('Error loading repositories')}
      emptyStateTitle={t('No repositories yet')}
      emptyStateDescription={t('To get started, create an repository.')}
      defaultTableView="list"
      {...view}
    />
  );
};

export function useRepositoriesColumns() {
  const tableColumns = useMemo<ITableColumn<Repository>[]>(
    () => [
      {
        header: '',
        cell: (repository) => (
          <>
            <TextCell text={repository.name} />
            <TextCell text={repository.description} />
          </>
        ),
      },
    ],
    []
  );
  return tableColumns;
}

export function useRepoFilters() {
  const { t } = useTranslation();
  return useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'keywords',
        label: t('Name'),
        type: 'string',
        query: 'keywords',
        comparison: 'contains',
      },
    ],
    [t]
  );
}
