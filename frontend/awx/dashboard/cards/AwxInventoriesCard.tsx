import { useTranslation } from 'react-i18next';
import { PageDashboardDonutCard } from '../../../../framework/PageDashboard/PageDonutChart';
import { usePageChartColors } from '../../../../framework/PageDashboard/usePageChartColors';
import { RouteObj } from '../../../common/Routes';

export function AwxInventoriesCard(props: { total: number; failed: number }) {
  const { t } = useTranslation();
  const { successfulColor, failedColor } = usePageChartColors();
  return (
    <PageDashboardDonutCard
      title={t('Inventories')}
      linkText={t('Go to Inventories')}
      to={RouteObj.Hosts}
      items={[
        {
          label: t('Ready'),
          count: props.total - props.failed,
          color: successfulColor,
        },
        {
          label: t('Sync failures'),
          count: props.failed,
          color: failedColor,
        },
      ]}
    />
  );
}
