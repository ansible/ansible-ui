import { ITableColumn, PageDashboardCard, PageTable } from '@ansible/ansible-ui-framework';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { DashboardTableCardProps, IDashboardTableItem } from '../types';
import { PageLoadingTable } from '../../../../../framework/PageTable/PageLoadingTable';

export function DashboardTableCard(props: DashboardTableCardProps) {
  const {
    id,
    title,
    help,
    firstColumnHeader,
    emptyStateTitle,
    items,
    errorStateTitle,
    error,
    loading,
  } = props;
  const keyFn = (item: IDashboardTableItem) => item.id;
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const { t } = useTranslation();

  const tableColumns: ITableColumn<IDashboardTableItem>[] = [
    {
      header: firstColumnHeader,
      cell: (item) => item.name,
    },
    {
      header: t('Total no. of jobs'),
      cell: (item) => item.execution_count,
    },
  ];

  return (
    <PageDashboardCard id={id} title={title} helpTitle={title} help={help} width="lg" height="md">
      {loading && <PageLoadingTable rows={5}></PageLoadingTable>}
      {!loading && (
        <PageTable
          autoHidePagination={true}
          disableBodyPadding={true}
          pageItems={items ?? []}
          tableColumns={tableColumns}
          errorStateTitle={errorStateTitle}
          error={error}
          itemCount={items?.length ?? 0}
          compact
          keyFn={keyFn}
          page={page}
          perPage={perPage}
          setPage={setPage}
          setPerPage={setPerPage}
          emptyStateIcon={PlusCircleIcon}
          emptyStateTitle={emptyStateTitle}
          emptyStateDescription={t('There is currently no data available.')}
          disableLastRowBorder
        ></PageTable>
      )}
    </PageDashboardCard>
  );
}
