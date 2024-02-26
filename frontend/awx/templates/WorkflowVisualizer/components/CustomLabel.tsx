import { useSize } from '@patternfly/react-topology';
import { LegacyRef } from 'react';
import { getPatternflyColor, pfDisabled } from '../../../../../framework';
import type { CustomLabelProps, EdgeStatus } from '../types';

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

export const CustomLabel = ({ children, status, xPoint, yPoint }: CustomLabelProps) => {
  const paddingX = 10;
  const paddingY = 4;

  const [textSize, textRef] = useSize([children]);
  const { width, height } = calculateDimensions(textSize, paddingX, paddingY);

  const x = xPoint - width / 2;
  const y = yPoint - height / 2;

  return (
    <g transform={`translate(${x}, ${y})`}>
      {textSize && (
        <rect
          style={getEdgeStyles(status)}
          x={0}
          y={0}
          width={width}
          height={height}
          rx={15}
          ry={15}
        />
      )}
      <text
        ref={textRef as LegacyRef<SVGTextElement>}
        style={{ fill: 'white' }}
        x={paddingX}
        y={height / 2}
        dy="0.35em"
      >
        {children}
      </text>
    </g>
  );
};
