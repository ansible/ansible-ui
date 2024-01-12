import {
  AnsibeTowerIcon,
  CheckCircleIcon,
  ClockIcon,
  EllipsisHIcon,
  ExclamationCircleIcon,
  MinusCircleIcon,
  PlusCircleIcon,
  QuestionCircleIcon,
  RegionsIcon,
  ServerIcon,
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
import { pfDanger, pfDisabled, pfInfo, pfSuccess } from '../../../../../framework';
import { CustomNodeProps } from '../types';

function getStatusIcon(nodeType: string) {
  switch (nodeType) {
    case 'ready':
      return <CheckCircleIcon style={{ fill: pfSuccess }} />;
    case 'installed':
      return <ClockIcon style={{ fill: pfInfo }} />;
    case 'provisioning':
      return <PlusCircleIcon style={{ fill: pfDisabled }} />;
    case 'deprovisioning':
      return <MinusCircleIcon style={{ fill: pfDisabled }} />;
    case 'unavailable':
    case 'deprovision-fail':
    case 'provision-fail':
      return <ExclamationCircleIcon style={{ fill: pfDanger }} />;
    default:
      return <QuestionCircleIcon style={{ fill: pfDisabled }} />;
  }
}

function getNodeIcon(nodeType: string) {
  switch (nodeType) {
    case 'hybrid':
      return ServerIcon;
    case 'execution':
      return AnsibeTowerIcon;
    case 'control':
      return RegionsIcon;
    case 'hop':
      return EllipsisHIcon;
    default:
      return AnsibeTowerIcon;
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
    const icon = data && getStatusIcon(data.nodeStatus);
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
        icon={<g>{icon}</g>}
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
