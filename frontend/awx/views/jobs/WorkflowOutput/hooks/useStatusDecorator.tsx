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
import { getStatusDecoratorIcon } from './workflowOutputStatusDecoratorIcon';

export function useStatusDecorator() {
  return useCallback((element: GraphElement) => {
    if (!isNode(element)) {
      return null;
    }
    const status: NodeStatus = element.getNodeStatus();

    const { x, y } = getDefaultShapeDecoratorCenter(TopologyQuadrant.upperLeft, element);
    const icon = status && getStatusDecoratorIcon(status, { x, y });

    if (icon === null) return null;
    const decorator = (
      <Decorator
        x={x}
        data-cy={`node-decorator-${status}`}
        data-testid={`node-decorator-${status}`}
        y={y}
        radius={DEFAULT_DECORATOR_RADIUS}
        showBackground
        icon={icon}
        className={`node-decorator-${status}-${element.getId()}`}
        ariaLabel={status}
      />
    );
    return decorator;
  }, []);
}
