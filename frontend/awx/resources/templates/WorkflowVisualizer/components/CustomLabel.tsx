import { FC, LegacyRef } from 'react';
import { useSize, WithContextMenuProps, WithSelectionProps } from '@patternfly/react-topology';
import { getPatternflyColor, pfDisabled } from '../../../../../../framework';
import type { CustomLabelProps, EdgeStatus } from '../types';
import { EllipsisVIcon } from '@patternfly/react-icons';

const getEdgeStyles = (
  status: EdgeStatus
): {
  fill: string;
  stroke: string;
} => {
  const pfStatusColor = getPatternflyColor(status) || pfDisabled;
  return {
    fill: pfStatusColor,
    stroke: pfStatusColor,
  };
};

const calculateDimensions = (
  textSize: { width: number; height: number } | null,
  paddingX: number,
  paddingY: number
) => {
  const width = textSize ? textSize.width + paddingX * 2 : 0;
  const height = textSize ? textSize.height + paddingY * 2 : 0;
  return { width, height };
};

export const CustomLabel: FC<
  CustomLabelProps & WithContextMenuProps & WithSelectionProps & { isSourceRootNode: boolean }
> = ({ children, xPoint, yPoint, status, onContextMenu, hoverRef, isSourceRootNode }) => {
  const paddingX = 10;
  const paddingY = 4;

  const [textSize, textRef] = useSize([children]);
  const { width, height } = calculateDimensions(textSize, paddingX, paddingY);

  const x = xPoint - width / 2;
  const y = yPoint - height / 2;

  const [iconSize, iconRef] = useSize([EllipsisVIcon, paddingX]);
  const contextIconRadius = textSize?.height ? `${textSize.height / 2}` : '0';
  return (
    <g transform={`translate(${x}, ${y})`} ref={hoverRef as LegacyRef<SVGTextElement>}>
      {textSize && (
        <rect
          style={getEdgeStyles(status)}
          x={0}
          y={0}
          width={isSourceRootNode || !onContextMenu ? textSize.width + 20 : textSize.width + 50}
          height={height}
          rx={15}
          ry={15}
        />
      )}
      <text
        ref={textRef as LegacyRef<SVGTextElement>}
        style={{ fill: 'white' }}
        x={isSourceRootNode || !onContextMenu ? 10 : paddingX}
        y={height / 2}
        dy="0.35em"
      >
        {children}
      </text>
      {!isSourceRootNode && onContextMenu && (
        <g ref={iconRef} className="pf-topology__node__action-icon">
          <line
            className="pf-topology__node__separator"
            x1={width}
            x2={width}
            y1={0}
            y2={`${height}`}
          />
          {iconSize && (
            <path
              data-cy="edge-context-menu_kebab"
              onClick={onContextMenu}
              d={`M${
                width + 2
              },1 h12q${contextIconRadius},0 ${contextIconRadius},${contextIconRadius} v2 q0,${contextIconRadius} -${contextIconRadius},${contextIconRadius} h-${contextIconRadius} z`}
              style={getEdgeStyles(status)}
            />
          )}
          <g data-cy="node-context-menu_kebab" transform={`translate(${width + 5}, ${height / 4})`}>
            <EllipsisVIcon style={{ fill: 'white' }} />
          </g>
        </g>
      )}
    </g>
  );
};
