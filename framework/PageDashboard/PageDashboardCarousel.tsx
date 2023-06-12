import { CardBody } from '@patternfly/react-core';
import { PageDashboardCard, PageDashboardCardWidth } from './PageDashboardCard';
import { PageCarousel } from '../PageCarousel/PageCarousel';
import { ReactNode } from 'react';

export function PageDashboardCarousel(props: {
  title?: string;
  linkText?: string;
  width?: PageDashboardCardWidth;
  children: ReactNode;
}) {
  return (
    <PageDashboardCard title={props.title} linkText={props.linkText} width={props.width}>
      <CardBody>
        <PageCarousel>{props.children}</PageCarousel>
      </CardBody>
    </PageDashboardCard>
  );
}
