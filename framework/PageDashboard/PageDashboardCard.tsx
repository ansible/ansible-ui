import { Card } from '@patternfly/react-core';
import { CSSProperties, ReactNode } from 'react';
import { usePageNavigate } from '../components/usePageNavigate';

export function PageDashboardCard(props: {
  to?: string;
  children: ReactNode;
  style?: CSSProperties;
}) {
  const history = usePageNavigate();
  return (
    <Card
      isFlat
      isSelectable={!!props.to}
      isRounded
      style={{ transition: 'box-shadow 0.25s', ...props.style }}
      onClick={() => props.to && history(props.to)}
    >
      {props.children}
    </Card>
  );
}
