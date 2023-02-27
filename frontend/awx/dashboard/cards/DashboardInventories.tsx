import { useTranslation } from 'react-i18next';
import { pfSuccess } from '../../../../framework';
import { PageDashboardDonutCard } from '../../../../framework/PageDashboard/PageDonutChart';
import { RouteObj } from '../../../Routes';
import { Inventory } from '../../interfaces/Inventory';

export function DashboardInventories(props: {
  inventories: { results?: Inventory[] | undefined } | undefined;
}) {
  const { t } = useTranslation();
  const { inventories } = props;

  if (!inventories?.results) {
    return <></>;
  }

  return (
    <PageDashboardDonutCard
      title={t('Inventories')}
      to={RouteObj.Inventories}
      items={[
        {
          label: t('Ready'),
          count:
            inventories?.results?.filter((i) => !i.inventory_sources_with_failures).length ?? 0,
          color: pfSuccess,
        },
        {
          label: t('Sync failures'),
          count: inventories?.results?.filter((i) => i.inventory_sources_with_failures).length ?? 0,
          color: pfSuccess,
        },
      ]}
    />
  );
}
