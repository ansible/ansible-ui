import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  SyncAltIcon,
  WarningTriangleIcon,
} from '@patternfly/react-icons';
import {
  DEFAULT_DECORATOR_RADIUS,
  Decorator,
  GraphElement,
  NodeStatus,
  TopologyQuadrant,
  getDefaultShapeDecoratorCenter,
  isNode,
} from '@patternfly/react-topology';
import { useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { pfDanger, pfInfo, pfSuccess, pfWarning } from '../../../../../../framework';

export function useStatusDecorator() {
  return useCallback((element: GraphElement) => {
    if (!isNode(element)) {
      return null;
    }
    const status: NodeStatus = element.getNodeStatus();

    const { x, y } = getDefaultShapeDecoratorCenter(TopologyQuadrant.upperLeft, element);
    const Icon = status && getStatusIcon(status, { x, y });

    if (Icon === null) return null;
    const decorator = (
      <Decorator
        x={x}
        data-cy={`node-decorator-${status}`}
        y={y}
        radius={DEFAULT_DECORATOR_RADIUS}
        showBackground
        icon={Icon}
        className={`node-decorator-${status}-${element.getId()}`}
        ariaLabel={status}
      />
    );
    return decorator;
  }, []);
}

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

function getStatusIcon(nodeType: string, centerPoint: { x: number; y: number }) {
  switch (nodeType) {
    case 'success':
    case 'successful':
      return <CheckCircleIcon data-cy="successful-icon" style={{ fill: pfSuccess }} />;
    case 'running':
      return (
        <IconWrapper data-cy="running-icon" centerPoint={centerPoint}>
          <SyncAltIcon style={{ fill: pfInfo }} />
        </IconWrapper>
      );
    case 'fail':
    case 'failed':
    case 'error':
      return <ExclamationCircleIcon data-cy="failed-icon" style={{ fill: pfDanger }} />;
    case 'pending':
    case 'waiting':
      return <ClockIcon sdata-cy="pending-icon" style={{ fill: pfInfo }} />;
    case 'canceled':
      return <WarningTriangleIcon data-cy="canceled-icon" style={{ fill: pfWarning }} />;
    default:
      return null;
  }
}
