import { Card } from '@patternfly/react-core';
import { ReactNode } from 'react';
import { usePageNavigate } from '../components/usePageNavigate';

export function PageDashboardCard(props: { to?: string; children: ReactNode }) {
  const history = usePageNavigate();
  return (
    <Card
      isFlat
      isSelectable
      isRounded
      style={{ transition: 'box-shadow 0.25s', minHeight: 300 }}
      onClick={() => props.to && history(props.to)}
    >
      {props.children}
    </Card>
  );
}
