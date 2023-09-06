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
  footerActionButton?: {
    icon?: ReactNode;
    title: string;
    onClick: () => void;
  };
}) {
  return (
    <PageDashboardCard
      title={props.title}
      linkText={props.linkText}
      to={props.to}
      width={props.width}
      footerActionButton={props.footerActionButton}
    >
      <CardBody>
        <PageCarousel carouselId={props.title.replace(/\s+/g, '-').toLowerCase()}>
          {props.children}
        </PageCarousel>
      </CardBody>
    </PageDashboardCard>
  );
}
