import { useTranslation } from 'react-i18next';
import { pfDanger, pfSuccess } from '../../../../framework';
import { PageDashboardDonutCard } from '../../../../framework/PageDashboard/PageDonutChart';
import { RouteObj } from '../../../Routes';
import { Host } from '../../interfaces/Host';

export function DashboardHosts(props: { hosts: { results?: Host[] | undefined } | undefined }) {
  const { t } = useTranslation();
  const { hosts } = props;

  if (!hosts?.results) {
    return <></>;
  }

  return (
    <PageDashboardDonutCard
      title={t('Hosts')}
      to={RouteObj.Hosts}
      items={[
        {
          label: t('Ready'),
          count: hosts.results?.filter((host) => !host.has_active_failures).length ?? 0,
          color: pfSuccess,
        },
        {
          label: t('Failed'),
          count: hosts.results?.filter((host) => host.has_active_failures).length ?? 0,
          color: pfDanger,
        },
      ]}
    />
  );
}
