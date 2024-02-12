import { useState, useRef, useEffect, FC, LegacyRef } from 'react';
import {
  Layer,
  StatusModifier,
  TOP_LAYER,
  WithContextMenuProps,
  WithSelectionProps,
  integralShapePath,
  isEdge,
  useHover,
  observer,
  WithSourceDragProps,
  WithTargetDragProps,
  EdgeTerminalType,
  ConnectorArrow,
  EdgeConnectorArrow,
  DefaultConnectorTerminal,
  Point,
  AnchorEnd,
  straightPath,
  usePolygonAnchor,
} from '@patternfly/react-topology';
import { css } from '@patternfly/react-styles';
import { CustomLabel } from './CustomLabel';
import { type CustomEdgeProps, type CustomEdgeInnerProps, EdgeStatus } from '../types';
import { START_NODE_ID } from '../constants';

function useCenterPoint(edgePath: string) {
  const [centerPoint, setCenterPoint] = useState<DOMPoint | undefined>();
  const pathRef = useRef<SVGPathElement>(null);
  const length = 0.5;

  useEffect(() => {
    const pathEl = pathRef.current;
    if (pathEl) {
      const totalLength = pathEl.getTotalLength();
      setCenterPoint(pathEl.getPointAtLength(totalLength * length));
    }
  }, [edgePath]);

  return { centerPoint, pathRef };
}

const CustomEdgeInner: FC<
  CustomEdgeInnerProps &
    WithContextMenuProps &
    WithSelectionProps &
    WithSourceDragProps &
    WithTargetDragProps
> = observer((props) => {
  const {
    element: edgeElement,
    contextMenuOpen,
    dragging,
    selected,
    onSelect,
    onContextMenu,
    targetDragRef,
    sourceDragRef,
    ...rest
  } = props;
  const [hover, hoverRef] = useHover(0);
  const [tagHover, tagHoverRef] = useHover(0);
  const startPoint = edgeElement.getStartPoint();

  const endPoint = edgeElement.getTarget().getPosition();
  const edgeEndPoint = edgeElement.getEndPoint();
  const halfTargetNodeHeight = edgeElement.getTarget().getDimensions().height / 2;
  const edgePath = integralShapePath(
    startPoint,
    { ...endPoint, y: endPoint.y - halfTargetNodeHeight } as Point,
    0,
    20
  );
  const { centerPoint, pathRef } = useCenterPoint(edgePath);
  const isSourceRootNode = edgeElement.getSource().getId() === START_NODE_ID;
  const data = edgeElement.getData();
  if (!data) return null;
  const { tag, tagStatus } = data;

  const edgeStyles = css(
    `pf-topology__edge ${StatusModifier[tagStatus]}`,
    (hover || tagHover) && 'pf-m-hover'
  );

  const getConnectorRotationAngle = (startPoint: Point, endPoint: Point): number =>
    180 - (Math.atan2(endPoint.y - startPoint.y, startPoint.x - endPoint.x) * 180) / Math.PI;

  return (
    <Layer id={dragging ? TOP_LAYER : undefined} {...rest}>
      <g
        data-test-id="task-handler"
        className={edgeStyles}
        fillOpacity={0}
        ref={hoverRef as LegacyRef<SVGTextElement>}
        onClick={onSelect}
      >
        <path
          className="pf-topology__edge__background"
          d={integralShapePath(startPoint, edgeEndPoint, 0, 20)}
        />
        <path
          strokeMiterlimit={25}
          strokeLinecap="round"
          d={integralShapePath(startPoint, edgeEndPoint, 0, 20)}
          transform="translate(0.5,0.5)"
          shapeRendering="geometricPrecision"
          className="pf-topology__edge__link"
          ref={pathRef}
        />
      </g>
      {centerPoint ? (
        <CustomLabel
          hoverRef={tagHoverRef}
          xPoint={centerPoint.x}
          yPoint={centerPoint.y}
          status={tagStatus}
          isSourceRootNode={isSourceRootNode}
          {...props}
        >
          {tag}
        </CustomLabel>
      ) : null}
      {centerPoint && (
        <g
          transform={`translate(${
            edgeEndPoint.x - 14
          }, ${edgeEndPoint?.y}) rotate(${getConnectorRotationAngle(
            centerPoint as Point,
            edgeEndPoint
          )})`}
        >
          <polygon
            transform={`translate(0.5,0.5) `}
            points=" 0,7 0,-7 14,0"
            className={`pf-topology-connector-arrow pf-topology__edge pf-topology__edge ${edgeStyles}`}
          />
        </g>
      )}
    </Layer>
  );
});

export const CustomEdge: FC<CustomEdgeProps & WithContextMenuProps & WithSelectionProps> = ({
  element,
  ...rest
}) => {
  if (!isEdge(element)) {
    throw new Error('CustomEdge must be used only on Edge elements');
  }
  return <CustomEdgeInner element={element} {...rest} />;
};
