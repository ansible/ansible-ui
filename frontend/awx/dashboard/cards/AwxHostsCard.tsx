import { useTranslation } from 'react-i18next';
import { pfDanger, pfSuccess } from '../../../../framework';
import { PageDashboardDonutCard } from '../../../../framework/PageDashboard/PageDonutChart';
import { RouteObj } from '../../../Routes';

export function AwxHostsCard(props: { total: number; failed: number }) {
  const { t } = useTranslation();
  return (
    <PageDashboardDonutCard
      title={t('Hosts')}
      linkText={t('Go to Hosts')}
      to={RouteObj.Hosts}
      items={[
        {
          label: t('Ready'),
          count: props.total - props.failed,
          color: pfSuccess,
        },
        {
          label: t('Failed'),
          count: props.failed,
          color: pfDanger,
        },
      ]}
    />
  );
}
