import { CSSProperties, ReactElement } from 'react';

/** Matches @patternfly/react-topology `DefaultNode` status decorator wrapper. */
export const TOPOLOGY_NODE_DECORATOR_STATUS_CLASS = 'pf-topology__node__decorator__status';

export function wrapTopologyDecoratorStatusIcon(icon: ReactElement): ReactElement {
  return <g className={TOPOLOGY_NODE_DECORATOR_STATUS_CLASS}>{icon}</g>;
}

/** For statuses without a PF `pf-m-*` decorator modifier (e.g. disabled/muted). */
export function topologyDecoratorStatusColorStyle(color: string): CSSProperties {
  return { '--pf-topology__node_decorator--Color': color } as CSSProperties;
}
