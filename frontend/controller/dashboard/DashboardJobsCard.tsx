import { CardBody, CardHeader, CardTitle, Flex, FlexItem } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { PageDashboardCard } from '../../../framework/PageDashboard/PageDashboardCard';
import { RouteE } from '../../Routes';
import { JobsChart } from './charts/JobsChart';

export function DashboardJobsCard() {
  const { t } = useTranslation();
  return (
    <PageDashboardCard to={RouteE.Jobs}>
      <CardHeader>
        <Flex style={{ width: '100%' }}>
          <FlexItem grow={{ default: 'grow' }}>
            <CardTitle>{t('Job runs in the last 30 days')}</CardTitle>
          </FlexItem>
          {/* <ToggleGroup>
            <ToggleGroupItem text={t('Job history')} isSelected />
            <ToggleGroupItem text={t('Organization history')} />
          </ToggleGroup> */}
        </Flex>
      </CardHeader>
      <CardBody>
        <JobsChart />
      </CardBody>
    </PageDashboardCard>
  );
}
