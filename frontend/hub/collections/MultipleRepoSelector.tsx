import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { usePulpView } from '../usePulpView';
import { IToolbarFilter } from '../../../framework';
import { nameKeyFn } from '../api';

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
  const view = usePulpView<Repository>({
    url: '/api/automation-hub/pulp/api/v3/repositories/ansible/ansible/',
    keyFn: nameKeyFn,
    toolbarFilters,
    tableColumns,
  });

  return (
    <PageTable<Repository>
      tableColumns={tableColumns}
      toolbarFilters={toolbarFilters}
      errorStateTitle={t('Error loading repositories')}
      emptyStateTitle={t('No repositories yet')}
      emptyStateDescription={t('To get started, create an repository.')}
      defaultTableView="table"
      {...view}
    />
  );
};

export function useRepositoriesColumns() {
  const { t } = useTranslation();
  const tableColumns = useMemo<ITableColumn<Repository>[]>(
    () => [
      {
        header: t('Name'),
        sort: 'name',
        cell: (repository) => (
          <>
            <TextCell text={repository.name} />
          </>
        ),
      },

      {
        header: t('Description'),
        cell: (repository) => (
          <>
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
        key: 'name',
        label: t('Name'),
        type: 'string',
        query: 'name',
        comparison: 'startsWith',
      },
    ],
    [t]
  );
}
