import { Card, CardTitle } from '@patternfly/react-core';
import { CSSProperties, ReactNode, useContext } from 'react';
import { pfLink } from '../components/pfcolors';
import { usePageNavigate } from '../components/usePageNavigate';
import { PageDashboardContext } from './PageDashboard';

export type PageDashboardCardWidth = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
export type PageDashboardCardHeight = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

const heightUnit = 32;

export function PageDashboardCard(props: {
  title?: string;
  to?: string;
  children?: ReactNode;
  width?: PageDashboardCardWidth;
  height?: PageDashboardCardHeight;
  style?: CSSProperties;
}) {
  const navigate = usePageNavigate();

  const dashboardContext = useContext(PageDashboardContext);

  let colSpan = 4;
  switch (props.width) {
    case 'xs':
      colSpan = 2;
      break;
    case 'sm':
      colSpan = 3;
      break;
    case 'md':
      colSpan = 4;
      break;
    case 'lg':
      colSpan = 6;
      break;
    case 'xl':
      colSpan = 8;
      break;
    case 'xxl':
      colSpan = 12;
      break;
  }

  if (colSpan > dashboardContext.columns) {
    colSpan = dashboardContext.columns;
  }

  let rowSpan = undefined;
  switch (props.height) {
    case 'xs':
      rowSpan = 2;
      break;
    case 'sm':
      rowSpan = 3;
      break;
    case 'md':
      rowSpan = 6;
      break;
    case 'lg':
      rowSpan = 8;
      break;
    case 'xl':
      rowSpan = 12;
      break;
  }

  const minHeight = rowSpan ? heightUnit * rowSpan + 16 * (rowSpan - 1) : undefined;

  return (
    <div
      style={{
        transition: 'box-shadow 0.25s',
        gridColumn: `span ${colSpan}`,
        gridRow: rowSpan ? `span ${rowSpan}` : undefined,
        minHeight,
        ...props.style,
      }}
    >
      <Card isFlat isRounded style={{ gridColumn: `span ${colSpan}`, minHeight, ...props.style }}>
        {props.title && (
          <>
            {props.to ? (
              <CardTitle
                style={{ color: pfLink, cursor: 'pointer' }}
                onClick={() => navigate(props.to)}
              >
                {props.title}
              </CardTitle>
            ) : (
              <CardTitle>{props.title}</CardTitle>
            )}
          </>
        )}
        {props.children}
      </Card>
    </div>
  );
}
