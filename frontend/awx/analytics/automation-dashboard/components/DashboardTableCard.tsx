import { ITableColumn, PageDashboardCard, PageTable } from '@ansible/ansible-ui-framework';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { DashboardTableCardProps, IDashboardTableItem } from '../types';
import { PageLoadingTable } from '../../../../../framework/PageTable/PageLoadingTable';
import { DEFAULT_NUMBER_LOCALE } from '../constants/common';

const TRUNCATED_NAME_CELL_MAX_WIDTH = 350;

const truncatedNameCellStyle: React.CSSProperties = {
  maxWidth: `${TRUNCATED_NAME_CELL_MAX_WIDTH}px`,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

export function DashboardTableCard(props: DashboardTableCardProps) {
  const {
    id,
    title,
    help,
    firstColumnHeader,
    items,
    errorStateTitle,
    error,
    loading,
    clearAllFilters,
    filterState,
    emptyStateDescription,
    emptyStateTitle,
  } = props;
  const keyFn = (item: IDashboardTableItem) => item.id;
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const { t } = useTranslation();

  const nameCell = (item: IDashboardTableItem) => {
    return <div style={truncatedNameCellStyle}>{item.name}</div>;
  };

  const valueCell = (item: IDashboardTableItem) => {
    return (
      <div
        style={{
          textAlign: 'right',
        }}
      >
        {item?.execution_count || item.execution_count === 0
          ? item.execution_count.toLocaleString(DEFAULT_NUMBER_LOCALE)
          : ''}
      </div>
    );
  };

  const tableColumns: ITableColumn<IDashboardTableItem>[] = [
    {
      header: firstColumnHeader,
      cell: nameCell,
      maxWidth: TRUNCATED_NAME_CELL_MAX_WIDTH,
    },
    {
      header: t('Total no. of jobs'),
      cell: valueCell,
      maxWidth: 104,
    },
  ];

  return (
    <PageDashboardCard
      id={id}
      title={title}
      helpTitle={title}
      help={help}
      width="md"
      height="md"
      disableBodyPadding
    >
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
          disableLastRowBorder
          clearAllFilters={clearAllFilters}
          filterState={filterState}
          emptyStateDescription={emptyStateDescription}
          emptyStateTitle={emptyStateTitle}
        ></PageTable>
      )}
    </PageDashboardCard>
  );
}
