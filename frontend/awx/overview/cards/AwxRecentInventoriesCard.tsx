import { PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import {
  PageTable,
  useDashboardColumns,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../framework';
import { PageDashboardCard } from '../../../../framework/PageDashboard/PageDashboardCard';
import { useOptions } from '../../../common/crud/useOptions';
import { awxAPI } from '../../common/api/awx-utils';
import { useAwxView } from '../../common/useAwxView';
import { Inventory } from '../../interfaces/Inventory';
import { ActionsResponse, OptionsResponse } from '../../interfaces/OptionsResponse';
import { AwxRoute } from '../../main/AwxRoutes';
import { useInventoriesColumns } from '../../resources/inventories/hooks/useInventoriesColumns';

export function AwxRecentInventoriesCard() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const getPageUrl = useGetPageUrl();

  const { data } = useOptions<OptionsResponse<ActionsResponse>>(awxAPI`/inventories/`);
  const canCreateInventory = Boolean(data && data.actions && data.actions['POST']);

  const view = useAwxView<Inventory>({
    url: awxAPI`/inventories/`,
    disableQueryString: true,
    defaultSort: 'modified',
    defaultSortDirection: 'desc',
  });

  let columns = useInventoriesColumns();
  columns = useDashboardColumns(columns);

  return (
    <PageDashboardCard
      title={t('Inventories')}
      subtitle={t('Recently updated inventories')}
      width="md"
      height="md"
      linkText={t('View all Inventories')}
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
        emptyStateDescription={
          canCreateInventory
            ? t('Create a inventory by clicking the button below..')
            : t(
                'Please contact your organization administrator if there is an issue with your access.'
              )
        }
        emptyStateButtonText={canCreateInventory ? t('Create inventory') : undefined}
        emptyStateButtonClick={
          canCreateInventory ? () => pageNavigate(AwxRoute.CreateInventory) : undefined
        }
        {...view}
        compact
        itemCount={view.itemCount !== undefined ? Math.min(view.itemCount, 7) : undefined}
        pageItems={view.pageItems ? view.pageItems.slice(0, 7) : []}
        disableLastRowBorder
      />
    </PageDashboardCard>
  );
}
