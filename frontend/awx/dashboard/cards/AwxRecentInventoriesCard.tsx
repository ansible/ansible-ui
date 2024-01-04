import { PlusCircleIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PageTable,
  useColumnsWithoutExpandedRow,
  useColumnsWithoutSort,
  useGetPageUrl,
  usePageNavigate,
  useVisibleModalColumns,
} from '../../../../framework';
import { PageDashboardCard } from '../../../../framework/PageDashboard/PageDashboardCard';
import { AwxRoute } from '../../AwxRoutes';
import { awxAPI } from '../../api/awx-utils';
import { Inventory } from '../../interfaces/Inventory';
import { useInventoriesColumns } from '../../resources/inventories/hooks/useInventoriesColumns';
import { useAwxView } from '../../useAwxView';

export function AwxRecentInventoriesCard() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const getPageUrl = useGetPageUrl();

  const view = useAwxView<Inventory>({
    url: awxAPI`/inventories/`,
    disableQueryString: true,
    defaultSort: 'modified',
    defaultSortDirection: 'desc',
  });

  let columns = useInventoriesColumns();
  columns = useVisibleModalColumns(columns);
  columns = useMemo(() => [...columns], [columns]);
  columns = useColumnsWithoutSort(columns);
  columns = useColumnsWithoutExpandedRow(columns);

  return (
    <PageDashboardCard
      title={t('Recent Inventories')}
      subtitle={t('Recently updated inventories')}
      width="md"
      height="md"
      linkText={t('Go to Inventories')}
      to={getPageUrl(AwxRoute.Inventories)}
    >
      <PageTable<Inventory>
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
        emptyStateButtonClick={() => pageNavigate(AwxRoute.CreateInventory)}
        {...view}
        compact
        itemCount={view.itemCount !== undefined ? Math.min(view.itemCount, 7) : undefined}
        pageItems={view.pageItems ? view.pageItems.slice(0, 7) : []}
        disableLastRowBorder
      />
    </PageDashboardCard>
  );
}
