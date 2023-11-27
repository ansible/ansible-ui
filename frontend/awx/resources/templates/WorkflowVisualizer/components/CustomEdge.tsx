import { useState, useRef, useEffect, FunctionComponent } from 'react';
import {
  Layer,
  StatusModifier,
  TOP_LAYER,
  integralShapePath,
  isEdge,
  observer,
} from '@patternfly/react-topology';
import { CustomLabel } from './CustomLabel';
import type { CustomEdgeProps, CustomEdgeInnerProps } from '../types';

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

const CustomEdgeInner: FunctionComponent<CustomEdgeInnerProps> = observer((props) => {
  const { element: edgeElement, dragging } = props;
  const startPoint = edgeElement.getStartPoint();
  const endPoint = edgeElement.getEndPoint();

  const edgePath = integralShapePath(startPoint, endPoint, 0, 20);
  const { centerPoint, pathRef } = useCenterPoint(edgePath);

  const data = edgeElement.getData();
  if (!data) return null;
  const { tag, tagStatus } = data;

  const edgeStyles = `pf-topology__edge ${StatusModifier[tagStatus]}`;

  return (
    <Layer id={dragging ? TOP_LAYER : undefined}>
      <g data-test-id="task-handler" className={edgeStyles} fillOpacity={0}>
        <path
          className="pf-topology__edge__background"
          d={integralShapePath(startPoint, endPoint, 0, 20)}
        />
        <path
          d={integralShapePath(startPoint, endPoint, 0, 20)}
          transform="translate(0.5,0.5)"
          shapeRendering="geometricPrecision"
          className="pf-topology__edge__link"
          ref={pathRef}
        />
      </g>
      {centerPoint ? (
        <CustomLabel xPoint={centerPoint.x} yPoint={centerPoint.y} status={tagStatus}>
          {tag}
        </CustomLabel>
      ) : null}
    </Layer>
  );
});

export const CustomEdge: FunctionComponent<CustomEdgeProps> = ({
  element,
  ...rest
}: CustomEdgeProps) => {
  if (!isEdge(element)) {
    throw new Error('CustomEdge must be used only on Edge elements');
  }
  return <CustomEdgeInner element={element} {...rest} />;
};
