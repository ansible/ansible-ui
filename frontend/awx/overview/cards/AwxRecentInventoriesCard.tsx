import { ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { PageTable, useDashboardColumns, useGetPageUrl } from '../../../../framework';
import { PageDashboardCard } from '../../../../framework/PageDashboard/PageDashboardCard';
import { PageTableEmptyState } from '../../../../framework/PageTable/PageTableEmptyState';
import { ButtonLink } from '../../../../framework/components/ButtonLink';
import { useOptions } from '../../../common/crud/useOptions';
import { awxAPI } from '../../common/api/awx-utils';
import { useAwxView } from '../../common/useAwxView';
import { Inventory } from '../../interfaces/Inventory';
import { ActionsResponse, OptionsResponse } from '../../interfaces/OptionsResponse';
import { AwxRoute } from '../../main/AwxRoutes';
import { useInventoriesColumns } from '../../resources/inventories/hooks/useInventoriesColumns';

export function AwxRecentInventoriesCard() {
  const { t } = useTranslation();
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
      id="inventories-card"
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
        emptyState={
          canCreateInventory ? (
            <PageTableEmptyState
              title={t('There are currently no inventories')}
              description={t('Create a inventory by clicking the button below.')}
            >
              <ButtonLink
                icon={<PlusCircleIcon />}
                variant={ButtonVariant.primary}
                href={getPageUrl(AwxRoute.CreateInventory)}
              >
                {t('Create inventory')}
              </ButtonLink>
            </PageTableEmptyState>
          ) : (
            <PageTableEmptyState
              icon={PlusCircleIcon}
              title={t('You do not have permission to create an inventory')}
              description={t(
                'Please contact your organization administrator if there is an issue with your access.'
              )}
            />
          )
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
