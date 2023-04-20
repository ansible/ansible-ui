import { useTranslation } from 'react-i18next';
import { pfDanger, pfSuccess } from '../../../../framework';
import { PageDashboardDonutCard } from '../../../../framework/PageDashboard/PageDonutChart';
import { RouteObj } from '../../../Routes';

export function AwxProjectsCard(props: { total: number; failed: number }) {
  const { t } = useTranslation();
  if (props.total === 0) return <></>;
  return (
    <PageDashboardDonutCard
      title={t('Projects')}
      linkText={t('Go to Projects')}
      to={RouteObj.Projects}
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
