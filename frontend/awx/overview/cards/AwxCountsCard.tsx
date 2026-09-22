import { useGetPageUrl } from '@ansible/ansible-ui-framework';
import { PageDashboardCountBar } from '@ansible/ansible-ui-framework/PageDashboard/PageDashboardCountBar';
import { usePageChartColors } from '@ansible/ansible-ui-framework/PageDashboard/usePageChartColors';
import { useTranslation } from 'react-i18next';
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
                  // Do not pass ready_status/failed_status. Those map to
                  // last_job_host_summary list filters: 2.7 OPTIONS still
                  // marks the dead FK filterable (stale results; Ready's
                  // not__ lookup can 400). AWX devel OPTIONS is correct
                  // (filterable:false after the FK was dropped) and the same
                  // query 400s. summary_fields still exist on both backends.
                  link: getPageUrl(AwxRoute.Hosts),
                },
                {
                  label: t('Failed'),
                  count: data.hosts.failed,
                  color: failedColor,
                  link: getPageUrl(AwxRoute.Hosts),
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
                  link: getPageUrl(AwxRoute.Projects, {
                    query: { status: ['successful'] },
                  }),
                },
                {
                  label: t('Failed'),
                  count: data.projects.failed,
                  color: failedColor,
                  link: getPageUrl(AwxRoute.Projects, {
                    query: { status: ['failed', 'error', 'canceled', 'missing'] },
                  }),
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
                  link: getPageUrl(AwxRoute.Inventories, {
                    query: { status: ['successful'] },
                  }),
                },
                {
                  label: t('Synced failures'),
                  count: data.inventories.inventory_failed,
                  color: failedColor,
                  link: getPageUrl(AwxRoute.Inventories, {
                    query: { status: ['failed', 'error', 'canceled', 'missing'] },
                  }),
                },
              ]
            : undefined,
        },
      ]}
    />
  );
}
