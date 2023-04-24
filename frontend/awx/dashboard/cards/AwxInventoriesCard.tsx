import { useTranslation } from 'react-i18next';
import { pfDanger, pfSuccess } from '../../../../framework';
import { PageDashboardDonutCard } from '../../../../framework/PageDashboard/PageDonutChart';
import { RouteObj } from '../../../Routes';

export function AwxInventoriesCard(props: { total: number; failed: number }) {
  const { t } = useTranslation();
  if (props.total === 0) return <></>;
  return (
    <PageDashboardDonutCard
      title={t('Inventories')}
      linkText={t('Go to inventories')}
      to={RouteObj.Hosts}
      items={[
        {
          label: t('Ready'),
          count: props.total - props.failed,
          color: pfSuccess,
        },
        {
          label: t('Sync failures'),
          count: props.failed,
          color: pfDanger,
        },
      ]}
    />
  );
}
