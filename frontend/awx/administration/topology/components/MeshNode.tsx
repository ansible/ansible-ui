import {
  BuilderImageIcon,
  CubeIcon,
  DataProcessorIcon,
  DatabaseIcon,
} from '@patternfly/react-icons';
import {
  DEFAULT_DECORATOR_RADIUS,
  Decorator,
  DefaultNode,
  TopologyQuadrant,
  WithSelectionProps,
  getDefaultShapeDecoratorCenter,
} from '@patternfly/react-topology';
import { useMemo } from 'react';
import { CustomNodeProps } from '../types';
import { getMeshNodeStatusDecoratorIcon } from './meshNodeStatusDecoratorIcon';

export function getNodeIcon(nodeType: string) {
  switch (nodeType) {
    case 'hybrid':
      return BuilderImageIcon;
    case 'execution':
      return CubeIcon;
    case 'control':
      return DatabaseIcon;
    case 'hop':
      return DataProcessorIcon;
    default:
      return DatabaseIcon;
  }
}

export const MeshNode: React.FC<CustomNodeProps & WithSelectionProps> = ({
  element,
  onSelect,
  selected,
}: CustomNodeProps) => {
  const data = element.getData();
  const Icon = data && getNodeIcon(data.nodeType);

  const statusDecorator = useMemo(() => {
    const icon = data && getMeshNodeStatusDecoratorIcon(data.nodeStatus);
    if (!icon) {
      return null;
    }
    const { x, y } = getDefaultShapeDecoratorCenter(TopologyQuadrant.upperLeft, element);

    const decorator = (
      <Decorator
        x={x}
        y={y}
        radius={DEFAULT_DECORATOR_RADIUS}
        showBackground
        onClick={onSelect}
        icon={icon}
        ariaLabel={data?.nodeStatus}
      />
    );

    return decorator;
  }, [data, element, onSelect]);

  return (
    <DefaultNode
      element={element}
      onSelect={onSelect}
      selected={selected}
      onStatusDecoratorClick={onSelect}
      truncateLength={20}
    >
      <g transform={`translate(13, 13)`}>
        {Icon && <Icon style={{ color: '#393F44' }} width={25} height={25} />}
      </g>
      {statusDecorator}
    </DefaultNode>
  );
};
