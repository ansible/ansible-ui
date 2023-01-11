import { CardBody, CardHeader, CardTitle } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { PageDashboardCard } from '../../../framework/PageDashboard/PageDashboardCard';
import { RouteE } from '../../Routes';
import { JobsChart } from './charts/JobsChart';

export function DashboardJobsCard() {
  const { t } = useTranslation();
  return (
    <PageDashboardCard to={RouteE.Jobs}>
      <CardHeader>
        <CardTitle>{t('Job runs in the last 30 days')}</CardTitle>
      </CardHeader>
      <CardBody>
        <JobsChart />
      </CardBody>
    </PageDashboardCard>
  );
}
