import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  SyncAltIcon,
} from '@patternfly/react-icons';
import { ReactElement } from 'react';
import styled, { keyframes } from 'styled-components';

/** Matches @patternfly/react-topology DefaultNode status decorator wrapper. */
export const TOPOLOGY_NODE_DECORATOR_STATUS_CLASS = 'pf-topology__node__decorator__status';

const Spin = keyframes`
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(1turn);
  }
`;

const IconWrapper = styled.g<{ centerPoint: { x: number; y: number } }>`
  animation: ${Spin} 1.75s linear infinite;
  transform-origin: ${({ centerPoint }) =>
    `${Number(centerPoint.x) + 1}px ${Number(centerPoint.y) + 1}px`};
`;

function wrapDecoratorStatusIcon(icon: ReactElement) {
  return <g className={TOPOLOGY_NODE_DECORATOR_STATUS_CLASS}>{icon}</g>;
}

export function getStatusDecoratorIcon(
  nodeType: string,
  centerPoint: { x: number; y: number }
): ReactElement | null {
  switch (nodeType) {
    case 'success':
    case 'successful':
      return wrapDecoratorStatusIcon(
        <CheckCircleIcon
          className="pf-m-success"
          data-cy="successful-icon"
          data-testid="successful-icon"
        />
      );
    case 'running':
      return wrapDecoratorStatusIcon(
        <IconWrapper data-cy="running-icon" data-testid="running-icon" centerPoint={centerPoint}>
          <SyncAltIcon className="pf-m-info" />
        </IconWrapper>
      );
    case 'fail':
    case 'failed':
    case 'error':
      return wrapDecoratorStatusIcon(
        <ExclamationCircleIcon
          className="pf-m-danger"
          data-cy="failed-icon"
          data-testid="failed-icon"
        />
      );
    case 'pending':
    case 'waiting':
      return wrapDecoratorStatusIcon(
        <ClockIcon className="pf-m-info" data-cy="pending-icon" data-testid="pending-icon" />
      );
    case 'canceled':
      return wrapDecoratorStatusIcon(
        <ExclamationTriangleIcon
          className="pf-m-warning"
          data-cy="canceled-icon"
          data-testid="canceled-icon"
        />
      );
    default:
      return null;
  }
}
