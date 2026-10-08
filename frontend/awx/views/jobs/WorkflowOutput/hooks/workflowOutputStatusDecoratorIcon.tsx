import {
  TOPOLOGY_NODE_DECORATOR_STATUS_CLASS,
  wrapTopologyDecoratorStatusIcon,
} from '../../../../common/topologyDecoratorStatus';
import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  SyncAltIcon,
} from '@patternfly/react-icons';
import { ReactElement } from 'react';
import styled, { keyframes } from 'styled-components';

export { TOPOLOGY_NODE_DECORATOR_STATUS_CLASS };

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

export function getStatusDecoratorIcon(
  nodeType: string,
  centerPoint: { x: number; y: number }
): ReactElement | null {
  switch (nodeType) {
    case 'success':
    case 'successful':
      return wrapTopologyDecoratorStatusIcon(
        <CheckCircleIcon
          className="pf-m-success"
          data-cy="successful-icon"
          data-testid="successful-icon"
        />
      );
    case 'running':
      return wrapTopologyDecoratorStatusIcon(
        <IconWrapper data-cy="running-icon" data-testid="running-icon" centerPoint={centerPoint}>
          <SyncAltIcon className="pf-m-info" />
        </IconWrapper>
      );
    case 'fail':
    case 'failed':
    case 'error':
      return wrapTopologyDecoratorStatusIcon(
        <ExclamationCircleIcon
          className="pf-m-danger"
          data-cy="failed-icon"
          data-testid="failed-icon"
        />
      );
    case 'pending':
    case 'waiting':
      return wrapTopologyDecoratorStatusIcon(
        <ClockIcon className="pf-m-info" data-cy="pending-icon" data-testid="pending-icon" />
      );
    case 'canceled':
      // PF6 DefaultNode uses ExclamationTriangleIcon + pf-m-warning for warning/canceled states.
      return wrapTopologyDecoratorStatusIcon(
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
