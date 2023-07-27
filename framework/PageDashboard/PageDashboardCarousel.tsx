import { CardBody } from '@patternfly/react-core';
import { PageDashboardCard, PageDashboardCardWidth } from './PageDashboardCard';
import { PageCarousel } from '../PageCarousel/PageCarousel';
import { ReactNode } from 'react';

export function PageDashboardCarousel(props: {
  title: string;
  linkText?: string;
  to?: string;
  width?: PageDashboardCardWidth;
  children: ReactNode;
}) {
  return (
    <PageDashboardCard
      title={props.title}
      linkText={props.linkText}
      to={props.to}
      width={props.width}
    >
      <CardBody>
        <PageCarousel carouselId={props.title.replace(/\s+/g, '-').toLowerCase()}>
          {props.children}
        </PageCarousel>
      </CardBody>
    </PageDashboardCard>
  );
}
