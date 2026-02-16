import { EdgeStyle, NodeStatus } from '@patternfly/react-topology';

export function getEdgeStyle(edge: string) {
  switch (edge) {
    case 'established':
      return EdgeStyle.default;
    case 'adding':
    case 'removing':
      return EdgeStyle.dashed;
    default:
      return EdgeStyle.default;
  }
}

export function getEdgeStatus(edge: string) {
  switch (edge) {
    case 'established':
      return NodeStatus.default;
    case 'adding':
      return NodeStatus.success;
    case 'removing':
      return NodeStatus.danger;
    default:
      return NodeStatus.default;
  }
}
