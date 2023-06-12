import { CardBody } from '@patternfly/react-core';
import { PageDashboardCard } from './PageDashboardCard';
import { PageCarousel } from '../PageCarousel/PageCarousel';

export function PageDashboardCarousel() {
  return (
    <PageDashboardCard>
      <CardBody>
        <PageCarousel />
      </CardBody>
    </PageDashboardCard>
  );
}
