import { useTranslation } from 'react-i18next';
import { useGetPageUrl } from '../../../../framework';
import { PageDashboardCountBar } from '../../../../framework/PageDashboard/PageDashboardCountBar';
import { usePageChartColors } from '../../../../framework/PageDashboard/usePageChartColors';
import { AwxRoute } from '../../main/AwxRoutes';
import { IAwxDashboardData } from '../AwxOverview';

export function AwxCountsCard(props: { data: IAwxDashboardData }) {
  const { t } = useTranslation();
  const { data } = props;
  const { successfulColor, failedColor } = usePageChartColors();
  const getPageUrl = useGetPageUrl();
  return (
    <PageDashboardCountBar
      counts={[
        {
          title: t('Hosts'),
          to: getPageUrl(AwxRoute.Hosts),
          counts: data?.hosts?.total
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
          to: getPageUrl(AwxRoute.Projects),
          counts: data?.projects?.total
            ? [
                {
                  label: t('Ready'),
                  count: data.projects.total - data.projects.failed,
                  color: successfulColor,
                  link: getPageUrl(AwxRoute.Projects) + '?status=successful',
                },
                {
                  label: t('Failed'),
                  count: data.projects.failed,
                  color: failedColor,
                  link: getPageUrl(AwxRoute.Projects) + '?status=failed,error,canceled,missing',
                },
              ]
            : undefined,
        },
        {
          title: t('Inventories'),
          to: getPageUrl(AwxRoute.Inventories),
          counts: data?.inventories?.total
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
