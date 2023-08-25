import { useTranslation } from 'react-i18next';
import { PageDashboardCountBar } from '../../../../framework/PageDashboard/PageDashboardCountBar';
import { usePageChartColors } from '../../../../framework/PageDashboard/usePageChartColors';
import { RouteObj } from '../../../Routes';
import { IAwxDashboardData } from '../AwxDashboard';

export function AwxCountsCard(props: { data: IAwxDashboardData }) {
  const { t } = useTranslation();
  const { data } = props;
  const { successfulColor, failedColor } = usePageChartColors();
  return (
    <PageDashboardCountBar
      counts={[
        {
          title: t('Hosts'),
          total: data?.hosts.total ?? 0,
          to: RouteObj.Hosts,
          counts:
            data?.hosts.total ?? 0
              ? [
                  {
                    label: t('Ready'),
                    count: data.hosts.total - data.hosts.failed,
                    color: successfulColor,
                  },
                  {
                    label: t('Failed'),
                    count: data.hosts.failed,
                    color: failedColor,
                  },
                ]
              : undefined,
        },
        {
          title: t('Projects'),
          total: data?.projects.total ?? 0,
          to: RouteObj.Projects,
          counts:
            data?.projects.total ?? 0
              ? [
                  {
                    label: t('Ready'),
                    count: data.projects.total - data.projects.failed,
                    color: successfulColor,
                  },
                  {
                    label: t('Failed'),
                    count: data.projects.failed,
                    color: failedColor,
                  },
                ]
              : undefined,
        },
        {
          title: t('Inventories'),
          total: data?.inventories.total ?? 0,
          to: RouteObj.Inventories,
          counts:
            data?.inventories.total ?? 0
              ? [
                  {
                    label: t('Synced'),
                    count: data.inventories.total - data.inventories.inventory_failed,
                    color: successfulColor,
                  },
                  {
                    label: t('Synced failures'),
                    count: data.inventories.inventory_failed,
                    color: failedColor,
                  },
                ]
              : undefined,
        },
      ]}
    />
  );
}
