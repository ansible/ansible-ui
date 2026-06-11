import { FC, LegacyRef } from 'react';
import {
  Layer,
  StatusModifier,
  TOP_LAYER,
  WithContextMenuProps,
  WithSelectionProps,
  isEdge,
  useHover,
  observer,
  WithSourceDragProps,
  WithTargetDragProps,
} from '@patternfly/react-topology';
import { css } from '@patternfly/react-styles';
import { CustomLabel } from './CustomLabel';
import { type CustomEdgeProps, type CustomEdgeInnerProps } from '../types';
import { START_NODE_ID } from '../constants';
import { useGetPath } from '../hooks/useGetPath';
import { EdgeTerminal } from './EdgeTerminal';

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

  const { path: edgePath, centerPoint } = useGetPath(edgeElement);
  const isSourceRootNode = edgeElement.getSource().getId() === START_NODE_ID;
  const data = edgeElement.getData();
  if (!data) return null;
  const { tag, tagStatus } = data;
  const edgeStyles = css(
    `pf-topology__edge ${StatusModifier[tagStatus]}`,
    (hover || tagHover) && 'pf-m-hover'
  );
  return (
    <Layer id={dragging ? TOP_LAYER : undefined} {...rest}>
      <g
        data-test-id="workflow-visualizer-edge"
        className={edgeStyles}
        fillOpacity={0}
        ref={hoverRef as LegacyRef<SVGTextElement>}
        onClick={onSelect}
      >
        <path className="pf-topology__edge__background" d={edgePath} />
        <path
          strokeMiterlimit={25}
          strokeLinecap="round"
          d={edgePath}
          transform="translate(0.5,0.5)"
          shapeRendering="geometricPrecision"
          className="pf-topology__edge__link"
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
      <EdgeTerminal
        target={edgeElement.getTarget().getPosition()}
        style={`pf-topology-connector-arrow pf-topology__edge pf-topology__edge ${edgeStyles}`}
      />
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
