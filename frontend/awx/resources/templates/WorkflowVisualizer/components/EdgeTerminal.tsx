import { Point } from '@patternfly/react-topology';
type BaseEdgeProps = {
  target: Point;
  style: string;
};
export const EdgeTerminal = (props: BaseEdgeProps) => {
  const { target, style } = props;
  return (
    <g transform={`translate(${target.x - 14}, ${target.y + 25})`}>
      <polygon
        transform={`translate(0.5,0.5) `}
        points=" 0,7 0,-7 14,0"
        className={`pf-topology-connector-arrow pf-topology__edge pf-topology__edge ${style}`}
      />
    </g>
  );
};
