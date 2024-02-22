import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  SyncAltIcon,
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
import { pfDanger, pfInfo, pfSuccess } from '../../../../../../framework';

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
        y={y}
        radius={DEFAULT_DECORATOR_RADIUS}
        showBackground
        icon={Icon}
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
      return <CheckCircleIcon style={{ fill: pfSuccess }} />;
    case 'running':
      return (
        <IconWrapper centerPoint={centerPoint}>
          <SyncAltIcon style={{ fill: pfInfo }} />
        </IconWrapper>
      );
    case 'fail':
    case 'failed':
      return <ExclamationCircleIcon style={{ fill: pfDanger }} />;
    case 'pending':
      return <ClockIcon style={{ fill: pfInfo }} />;
    default:
      return null;
  }
}
