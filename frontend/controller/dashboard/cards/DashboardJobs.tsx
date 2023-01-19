import { CardBody, CardHeader, CardTitle, Flex, FlexItem } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { PageDashboardCard } from '../../../../framework/PageDashboard/PageDashboardCard';
import { RouteE } from '../../../Routes';
import { JobsChart } from '../charts/JobsChart';

export function DashboardJobsCard() {
  const { t } = useTranslation();

  //   <Card isRounded isFlat>
  //   <CardHeader>
  //     <CardTitle>Create your first job template</CardTitle>
  //   </CardHeader>
  //   <CardBody>
  //     <Stack hasGutter>
  //       <StackItem>To get started, create your first job template.</StackItem>
  //       <StackItem>
  //         <Button>Create job template</Button>
  //       </StackItem>
  //     </Stack>
  //   </CardBody>
  // </Card>

  return (
    <PageDashboardCard to={RouteE.Jobs} style={{ minHeight: 300 }}>
      <CardHeader>
        <Flex style={{ width: '100%' }}>
          <FlexItem grow={{ default: 'grow' }}>
            <CardTitle>{t('Job runs in the last 30 days')}</CardTitle>
          </FlexItem>
        </Flex>
      </CardHeader>
      <CardBody>
        <JobsChart />
      </CardBody>
    </PageDashboardCard>
  );
}
