import { PlusCircleIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  PageTable,
  useColumnsWithoutExpandedRow,
  useColumnsWithoutSort,
  useVisibleModalColumns,
} from '../../../../framework';
import { PageDashboardCard } from '../../../../framework/PageDashboard/PageDashboardCard';
import { RouteObj } from '../../../common/Routes';
import { useModifiedColumn } from '../../../common/columns';
import { Inventory } from '../../interfaces/Inventory';
import { useInventoriesColumns } from '../../resources/inventories/hooks/useInventoriesColumns';
import { IAwxView } from '../../useAwxView';

export function AwxRecentInventoriesCard(props: {
  view: IAwxView<Inventory>;
  showEmptyStateNonAdmin: boolean;
}) {
  const { view, showEmptyStateNonAdmin } = props;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const modifiedColumn = useModifiedColumn();

  let columns = useInventoriesColumns();
  columns = useVisibleModalColumns(columns);
  columns = useMemo(() => [...columns, modifiedColumn], [columns, modifiedColumn]);
  columns = useColumnsWithoutSort(columns);
  columns = useColumnsWithoutExpandedRow(columns);

  return (
    <PageDashboardCard
      title={t('Recent Inventories')}
      subtitle={t('Recently updated inventories')}
      width="lg"
      height="md"
      linkText={t('Go to Inventories')}
      to={RouteObj.Inventories}
    >
      {showEmptyStateNonAdmin ? (
        <PageTable
          disableBodyPadding={true}
          tableColumns={columns}
          autoHidePagination={true}
          errorStateTitle={t('Error loading inventories')}
          emptyStateVariant={'light'}
          emptyStateTitle={t('There are currently no inventories')}
          {...view}
          compact
          itemCount={view.itemCount !== undefined ? Math.min(view.itemCount, 7) : undefined}
          pageItems={view.pageItems ? view.pageItems.slice(0, 7) : []}
          disableLastRowBorder
        />
      ) : (
        <PageTable
          disableBodyPadding={true}
          tableColumns={columns}
          autoHidePagination={true}
          errorStateTitle={t('Error loading inventories')}
          emptyStateIcon={PlusCircleIcon}
          emptyStateButtonIcon={<PlusCircleIcon />}
          emptyStateVariant={'light'}
          emptyStateTitle={t('There are currently no inventories')}
          emptyStateDescription={t('Create a inventory by clicking the button below.')}
          emptyStateButtonText={t('Create inventory')}
          emptyStateButtonClick={() => navigate(RouteObj.CreateInventory)}
          {...view}
          compact
          itemCount={view.itemCount !== undefined ? Math.min(view.itemCount, 7) : undefined}
          pageItems={view.pageItems ? view.pageItems.slice(0, 7) : []}
          disableLastRowBorder
        />
      )}
    </PageDashboardCard>
  );
}
